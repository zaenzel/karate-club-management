# TKT-013: Menutup ujian dan riwayat tingkatan (api)

| Field           | Nilai            |
| --------------- | ---------------- |
| Area            | api              |
| Prioritas       | P0               |
| Ukuran          | M                |
| Status          | Review           |
| Bergantung pada | TKT-012          |
| Membuka         | TKT-015, TKT-018 |
| Asumsi terkait  | A8               |

## Konteks

Saat Super Admin menutup ujian (status `FINISHED`): hasil dikunci, riwayat tingkatan dibuat untuk
peserta yang lulus, cache tingkatan member diperbarui, lalu (di TKT-018) sertifikat masuk antrian.
Ini operasi paling sensitif di fase 1: harus atomik, tidak boleh dijalankan dua kali, dan tidak
boleh menghasilkan data setengah jadi.

## Tujuan

`POST /api/exams/:id/finish` menutup ujian secara atomik dan membuat `GradeHistory` `source = EXAM`
untuk setiap peserta lulus.

## Scope

### Termasuk

- Endpoint `finish` dan service-nya.
- Titik sambung (hook) untuk pembuatan sertifikat yang akan diisi TKT-018.

### Tidak termasuk

- Membuat baris sertifikat (TKT-018) dan render (TKT-019).
- Membuka kembali ujian yang sudah selesai (tidak ada di requirements).

## Bacaan wajib

- `docs/requirements.md` bagian Ujian (kalimat "Saat selesai"), `docs/architecture.md` bagian Alur
  sertifikat, model `GradeHistory`, `grade-rules.ts` (`computeResultGrade`), `exam-status.ts`.

## Langkah-langkah

1. Tambah `canFinish(status)` (hanya `ONGOING`) di `exam-status.ts` + test.
2. **Prasyarat** (409 dengan pesan jelas bila gagal):
   - status `ONGOING`;
   - minimal satu peserta;
   - semua peserta sudah punya `result` (A8). Pesan menyebut jumlah dan nama peserta yang belum
     dinilai (maksimal 5 nama + "dan N lainnya");
   - status bayar **tidak** menghalangi (A8).
3. **Transaksi** (`prisma.$transaction`, isolasi `Serializable` atau kunci baris event dengan
   `SELECT ... FOR UPDATE` lewat `$queryRaw`; pilih satu dan jelaskan di komentar):
   1. baca ulang event di dalam transaksi dan cek lagi `ONGOING` (mencegah double finish);
   2. untuk tiap peserta `PASSED`:
      - baca tingkatan member **saat ini**; jika berbeda dari snapshot `from*` peserta
        (seharusnya tidak terjadi karena A7), batalkan seluruh transaksi dengan 409 yang menyebut
        member tersebut;
      - hitung tingkatan baru dengan `computeResultGrade` (jangan hitung ulang dengan cara lain);
      - buat `GradeHistory` `{ source: EXAM, examParticipantId, from*, to*, occurredAt: tanggal
ujian }`;
      - perbarui cache `members.beltId/kyu/dan`;
   3. ubah status event menjadi `FINISHED`;
   4. audit `exam.finish` dengan ringkasan jumlah lulus/tidak lulus;
   5. panggil `this.examFinishedHooks` (lihat langkah 4) **di dalam** transaksi yang sama dengan
      `tx`.
4. **Hook sertifikat**: buat interface sederhana, misal
   `ExamFinishedHandler { handle(tx, examId, passedParticipantIds): Promise<void> }`, yang
   disuntikkan sebagai provider opsional (array kosong di tiket ini). TKT-018 akan mendaftarkan
   handler pembuatan sertifikat. Tujuannya: modul ujian tidak bergantung langsung ke modul
   sertifikat.
5. Setelah `FINISHED`, pastikan semua endpoint ubah peserta/hasil/pembayaran/penguji/event
   menolak (sudah lewat `canEdit`; tambahkan test regresi).
6. Respons: detail event terbaru (bentuk sama dengan `GET /api/exams/:id`).
7. **Test**:
   - unit dengan Prisma tiruan: prasyarat (status salah, peserta tanpa hasil), alur sukses
     (riwayat dibuat hanya untuk yang lulus, member diperbarui, status berubah), handler dipanggil
     dengan id peserta lulus;
   - test integrasi dengan database sungguhan **jika** TKT-003 sudah menyiapkan cara menjalankannya;
     jika belum, tulis skenario uji manual di bawah dan jalankan.

## Jangan lakukan

- Jangan menulis ke member di luar transaksi atau memecah proses jadi beberapa request.
- Jangan membuat riwayat untuk peserta `FAILED`.
- Jangan memanggil service modul sertifikat langsung dari modul ujian (pakai hook).
- Jangan menyediakan endpoint "reopen".
- Jangan mengubah `fromKyu`/`toKyu` hasil hitung tanpa `computeResultGrade`.

## Best practice

- Ambil semua data yang dibutuhkan dalam beberapa query besar, bukan query per peserta di luar
  transaksi.
- Endpoint idempoten secara aman: pemanggilan kedua membalas 409 `Ujian sudah selesai`, tanpa efek
  samping.

## Kriteria selesai

- [ ] Ujian ONGOING dengan semua hasil terisi bisa ditutup; status menjadi FINISHED.
- [ ] Peserta lulus punya `GradeHistory` EXAM dan cache member ter-update; peserta gagal tidak
      berubah.
- [ ] Ujian dengan peserta belum dinilai tidak bisa ditutup; finish kedua kali ditolak.
- [ ] Setelah FINISHED semua perubahan ditolak.
- [ ] Hook untuk TKT-018 tersedia dan teruji.
- [ ] `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
```

Uji manual: buat cabang, 3 member (putih kyu 10, biru kyu 1, hitam), satu ujian KYU dengan 2
member pertama, mulai, isi hasil (satu lulus turun 1 ke kuning, satu lulus turun 1 ke hitam), tutup.
Cek `GET /api/members/:id/grade-history` keduanya dan pastikan hasilnya kuning kyu 9 dan hitam
kyu 0 dan dan 1. Coba tutup lagi: harus 409.

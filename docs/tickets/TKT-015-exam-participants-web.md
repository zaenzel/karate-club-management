# TKT-015: Peserta, hasil, dan tutup ujian (web)

| Field           | Nilai                  |
| --------------- | ---------------------- |
| Area            | web                    |
| Prioritas       | P0                     |
| Ukuran          | L                      |
| Status          | Todo                   |
| Bergantung pada | TKT-013, TKT-014       |
| Membuka         | TKT-023                |
| Asumsi terkait  | A1, A2, A5, A6, A7, A8 |

## Konteks

Di halaman detail ujian (TKT-014), admin mengelola peserta: menambahkan member dari banyak cabang,
mengatur biaya dan status bayar, mengisi hasil lulus/tidak lulus beserta penurunan kyu atau
kenaikan dan serta warna sabuk baru, lalu menutup ujian.

## Tujuan

Seluruh alur peserta sampai tutup ujian bisa dilakukan dari web dengan umpan balik yang jelas.

## Scope

### Termasuk

- Tabel peserta di detail ujian (filter cabang, hasil, status bayar).
- Dialog "Tambah peserta": cari member eligible, pilih banyak, kirim sekaligus, tampilkan yang
  ditolak beserta alasan.
- Ubah biaya + status bayar per peserta.
- Input hasil per peserta dengan pratinjau tingkatan hasil.
- Tombol "Tutup ujian" dengan konfirmasi dan ringkasan.

### Tidak termasuk

- Sertifikat (TKT-020 menambahkan kolom/tautan sertifikat nanti).
- Input hasil massal via upload file.

## Bacaan wajib

- Kontrak api TKT-012 dan TKT-013, fitur `exams` dari TKT-014, README tiket Asumsi.

## Langkah-langkah

1. Tambah ke fitur `exams` (bukan fitur baru, supaya tidak import antar fitur): tipe
   `ExamParticipant`, `PaymentStatus` (label: `UNPAID: 'Belum bayar'`, `PAID: 'Lunas'`,
   `WAIVED: 'Dibebaskan'`), `ExamResult` (`PASSED: 'Lulus'`, `FAILED: 'Tidak lulus'`).
2. `api/`: `get-participants`, `get-eligible-members`, `add-participants`, `remove-participant`,
   `update-participant-payment`, `update-participant-result`, `finish-exam`, `get-belts`. Semua
   mutation meng-invalidate daftar peserta **dan** detail ujian (karena ringkasan berubah).
3. `schemas/participant-result-schema.ts`: `result` wajib; untuk `PASSED` di ujian KYU:
   `kyuDecrease` > 0 kelipatan 0.5 (default 1), `toBeltId` wajib (default sabuk sebelumnya); untuk
   DAN: `danIncrease` bilangan bulat ≥ 1 (default 1). Buat fungsi pratinjau kecil yang meniru
   aturan api (kyu hasil ≥ 0, hitam hanya bila kyu hasil 0, warna tidak turun) untuk umpan balik
   langsung. Test schema dan fungsi pratinjau.
4. Komponen dumb + test:
   - `participant-table.tsx`: No. anggota, Nama, Cabang, Tingkatan awal, Biaya, Status bayar,
     Hasil, Tingkatan baru (pratinjau), Aksi.
   - `add-participants-dialog.tsx`: pencarian (debounce), checkbox, hasil ditolak tampil dalam
     daftar alasan.
   - `participant-payment-form.tsx`, `participant-result-form.tsx` (pilihan warna sabuk
     menampilkan semua sabuk, yang tidak sah dinonaktifkan dengan keterangan).
   - `finish-exam-dialog.tsx`: ringkasan jumlah lulus, tidak lulus, belum dinilai; tombol nonaktif
     bila masih ada yang belum dinilai, dengan keterangan. Peringatan: "Setelah ditutup, hasil
     tidak bisa diubah."
5. Container `exam-participants-container.tsx` di detail ujian. Kontrol aktif sesuai status:
   - Draf: tambah/hapus peserta, ubah pembayaran; input hasil nonaktif;
   - Berlangsung: semua aktif termasuk hasil dan tutup ujian;
   - Selesai: semua read-only.
6. Setelah tutup ujian sukses, tampilkan pesan sukses dan refresh detail (status Selesai).

## Jangan lakukan

- Jangan menghitung warna sabuk otomatis (A1); default hanya "sama dengan sebelumnya".
- Jangan mengirim hasil semua peserta sebagai satu request besar; satu request per peserta sesuai
  kontrak api.
- Jangan menganggap pratinjau web sebagai kebenaran; selalu tampilkan pesan api bila menolak.
- Jangan import fitur `members` untuk pencarian member; pakai endpoint `eligible-members` lewat
  fitur `exams`.

## Best practice

- Tabel bisa panjang (puluhan sampai ratusan peserta): hindari render ulang seluruh tabel saat satu
  baris berubah (komponen baris terpisah, `key` stabil).
- Format kyu desimal dengan koma (`9,5`).
- Aksi destruktif (hapus peserta, tutup ujian) selalu lewat dialog konfirmasi.

## Kriteria selesai

- [ ] Peserta dari beberapa cabang bisa ditambah sekaligus; penolakan tampil per member.
- [ ] Biaya dan status bayar bisa diubah per peserta.
- [ ] Hasil bisa diisi dengan default yang benar dan pratinjau tingkatan baru.
- [ ] Tutup ujian berjalan; setelahnya halaman read-only.
- [ ] Kontrol mengikuti status Draf/Berlangsung/Selesai.
- [ ] Test lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/web check
pnpm check && pnpm format:check
```

Uji manual skenario yang sama dengan TKT-013, seluruhnya lewat web.

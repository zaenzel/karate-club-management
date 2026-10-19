# TKT-012: Peserta, biaya, dan hasil ujian (api)

| Field           | Nilai                       |
| --------------- | --------------------------- |
| Area            | api                         |
| Prioritas       | P0                          |
| Ukuran          | L                           |
| Status          | Todo                        |
| Bergantung pada | TKT-008, TKT-011            |
| Membuka         | TKT-013                     |
| Asumsi terkait  | A1, A2, A4, A5, A6, A7, A11 |

## Konteks

Peserta satu event boleh dari banyak cabang. Saat didaftarkan, kondisi member dicatat sebagai
snapshot (`fromBeltId`, `fromKyu`, `fromDan`). Biaya peserta default dari `exam.baseFee` dan bisa
ditimpa per peserta. Status bayar: `UNPAID`, `PAID`, `WAIVED`.

Hasil per peserta hanya `PASSED` atau `FAILED`. Untuk yang lulus, admin mengisi:

- ujian **KYU**: `kyuDecrease` (default 1; boleh 0.5, 2, atau lebih) dan `toBeltId` (warna baru,
  **dipilih manual**, default sama dengan warna sebelumnya; asumsi A1);
- ujian **DAN**: `danIncrease` (default 1); sabuk tetap hitam.

Tiket ini **belum** mengubah data member; itu terjadi saat ujian ditutup (TKT-013).

## Tujuan

Admin bisa mendaftarkan dan mengeluarkan peserta, mengatur biaya dan status bayar, serta mengisi
hasil dengan validasi aturan sabuk/kyu/dan yang benar.

## Scope

### Termasuk

- `GET /api/exams/:examId/participants` (tanpa pagination atau dengan pagination besar; filter
  `branchId`, `result`, `paymentStatus`; berisi data member ringkas dan pratinjau tingkatan hasil).
- `POST /api/exams/:examId/participants` body `{ memberIds: string[] }` (daftar banyak sekaligus).
- `DELETE /api/exams/:examId/participants/:participantId`.
- `PATCH /api/exams/:examId/participants/:participantId/payment` body `{ fee?, paymentStatus? }`.
- `PATCH /api/exams/:examId/participants/:participantId/result` body
  `{ result, kyuDecrease?, danIncrease?, toBeltId? }`.
- `GET /api/exams/:examId/eligible-members?q=&branchId=` (member yang boleh didaftarkan).

### Tidak termasuk

- Menutup ujian dan membuat riwayat tingkatan (TKT-013).
- Komponen nilai atau raport (ditunda).
- Syarat absensi/durasi latihan (sengaja tidak ada).

## Bacaan wajib

- `docs/requirements.md` bagian Sabuk dan Ujian, model `ExamParticipant`, `grade-rules.ts` dari
  TKT-008, `exam-status.ts` dari TKT-011, README tiket Asumsi A1, A2, A4 sampai A7, A11.

## Langkah-langkah

1. **Aturan hasil murni** — tambahkan ke `grade-rules.ts` (jangan duplikasi):
   `computeResultGrade({ examType, from: { beltOrder, kyu, dan }, kyuDecrease, danIncrease,
toBeltOrder, blackOrder })` yang mengembalikan `{ ok: true, to: { beltOrder, kyu, dan } }` atau
   `{ ok: false, errors: string[] }`:
   - **KYU**: peserta tidak boleh sudah hitam. `kyuDecrease` > 0, kelipatan 0.5 (A2). `toKyu =
fromKyu - kyuDecrease`, tidak boleh < 0 (A11, ditolak). `toBeltOrder ≥ fromBeltOrder` (A6).
     Hitam hanya bila `toKyu === 0` (A5). Jika naik ke hitam, `toDan = 1` (A4, sudah dikonfirmasi: sabuk hitam pertama langsung dan 1).
   - **DAN**: peserta harus hitam. `danIncrease` bilangan bulat ≥ 1. `toDan = fromDan +
danIncrease` (member hitam selalu punya dan ≥ 1). Sabuk tetap hitam, kyu tetap 0.
   - Hitung dengan aman untuk desimal (bekerja dalam satuan setengah kyu, `kyu * 2` integer, atau
     pakai `Prisma.Decimal`). Jangan memakai float langsung.
   - Test tuntas: 10 turun 1 jadi 9; 10 turun 0.5 jadi 9.5; 1 turun 2 ditolak; 1 turun 1 ke hitam
     valid; 2 turun 1 ke hitam ditolak; biru ke hijau ditolak; ujian DAN untuk non-hitam ditolak;
     dan 1 + 1 = 2; dan 2 + 2 = 4; naik ke hitam menghasilkan dan 1.
2. **Pendaftaran** (`POST participants`):
   - event harus `DRAFT` atau `ONGOING`;
   - tipe ujian cocok: KYU untuk member non-hitam, DAN untuk member hitam (pesan per member yang
     ditolak);
   - tolak member yang sudah terdaftar di event ini (unique `examId+memberId`) atau di event lain
     yang belum `FINISHED` (A7);
   - snapshot `fromBeltId/fromKyu/fromDan` dari cache member saat ini, `fee = exam.baseFee`,
     `paymentStatus = UNPAID`;
   - semua dalam satu transaksi; balas daftar yang berhasil dan yang ditolak beserta alasannya
     (jangan gagal semua karena satu member).
3. **Keluarkan peserta**: boleh selama event belum `FINISHED`, termasuk bila hasil sudah diisi.
4. **Pembayaran**: `fee` integer ≥ 0, `paymentStatus` enum. Bisa diubah selama belum `FINISHED`.
   Jika `paymentStatus = WAIVED`, `fee` tetap disimpan (jangan dinolkan otomatis).
5. **Hasil**:
   - hanya saat event `ONGOING` (hasil tidak bisa diisi saat `DRAFT` atau setelah `FINISHED`);
   - `FAILED`: simpan `result`, kosongkan `kyuDecrease`, `danIncrease`, `toBeltId`;
   - `PASSED`: isi default bila kosong (`kyuDecrease = 1` untuk KYU, `danIncrease = 1` untuk DAN,
     `toBeltId = fromBeltId`), validasi dengan `computeResultGrade`, 409 + pesan bila gagal;
   - hasil bisa diubah berkali-kali selama `ONGOING`;
   - audit `exam.result` dengan before/after.
6. **Eligible members**: member yang tipe sabuknya cocok dengan jenis ujian dan belum terdaftar di
   ujian aktif mana pun; cari nama/nomor anggota; batasi 50 hasil.
7. **Respons peserta**: `{ id, member: { id, memberNumber, name, branch: { id, name } },
from: { belt, kyu, dan }, fee, paymentStatus, result, kyuDecrease, danIncrease, toBelt,
preview: { belt, kyu, dan } | null }` dengan `preview` dihitung dari `computeResultGrade` untuk
   peserta lulus.
8. **Test service**: pendaftaran campuran (sebagian ditolak), pendaftaran di event FINISHED
   ditolak, member di dua ujian aktif ditolak, hasil saat DRAFT ditolak, PASSED dengan default,
   PASSED tidak valid ditolak, FAILED membersihkan field.

## Jangan lakukan

- Jangan mengubah `members` atau membuat `GradeHistory` di tiket ini.
- Jangan menghitung warna sabuk dari kyu (A1).
- Jangan menyimpan kyu sebagai float; jangan membandingkan Decimal dengan `===`.
- Jangan mendaftarkan peserta dengan syarat absensi atau lama latihan.
- Jangan mengubah `fee` peserta saat `baseFee` event diubah.

## Best practice

- Satu fungsi murni untuk semua validasi tingkatan, dipakai saat input hasil dan saat menutup ujian.
- Pesan error menyebut nama member bila menyangkut banyak peserta.
- Hindari N+1 query: ambil member dan sabuk dalam satu query dengan `include`/`in`.

## Kriteria selesai

- [ ] Peserta dari banyak cabang bisa didaftarkan sekaligus; yang tidak memenuhi syarat dilaporkan
      tanpa menggagalkan yang lain.
- [ ] Biaya dan status bayar bisa diatur per peserta.
- [ ] Hasil lulus/tidak lulus tersimpan dengan default dan validasi aturan sabuk/kyu/dan.
- [ ] Fungsi `computeResultGrade` punya test tuntas sesuai daftar di langkah 1.
- [ ] `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
pnpm check && pnpm format:check
```

## Catatan

- Jika user menjawab asumsi A4 sampai A7 atau A11 berbeda dari default, ubah hanya
  `grade-rules.ts` (dan test-nya) serta cek pendaftaran (A7).

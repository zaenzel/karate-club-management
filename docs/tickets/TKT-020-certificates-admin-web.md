# TKT-020: Daftar dan unduh sertifikat untuk admin (api + web)

| Field           | Nilai                                 |
| --------------- | ------------------------------------- |
| Area            | api / web                             |
| Prioritas       | P0                                    |
| Ukuran          | M                                     |
| Status          | Review                                |
| Bergantung pada | TKT-018 (unduhan nyata butuh TKT-019) |
| Membuka         | TKT-023                               |
| Asumsi terkait  | -                                     |

## Konteks

Admin perlu melihat sertifikat per ujian dan per member, memantau status render (`PENDING`,
`READY`, `FAILED`), mengunduh PDF/PNG, menerbitkan ulang, menyusulkan sertifikat (backfill), dan
mencoba ulang render yang gagal.

## Tujuan

Halaman `/certificates` dan bagian sertifikat di detail ujian serta detail member.

## Scope

### Termasuk

- Api: `GET /api/certificates` (pagination; filter `examId`, `memberId`, `status`, `isActive`; cari
  nomor sertifikat/nama/nomor anggota), `GET /api/certificates/:id`,
  `GET /api/certificates/:id/download?format=pdf|png` (balas `{ url }` presigned; 409 jika belum
  `READY`).
- Web: fitur `certificates` (halaman daftar dengan filter, aksi unduh PDF/PNG, terbit ulang,
  retry bila `FAILED`).
- Tombol "Buat sertifikat yang belum ada" (backfill) di detail ujian Selesai (fitur `exams`, fungsi
  API sendiri).
- Daftar sertifikat singkat di detail member (fitur `members`, fungsi API sendiri).

### Tidak termasuk

- Download publik (TKT-021, TKT-022).
- Render (TKT-019).

## Bacaan wajib

- Kontrak TKT-018 dan TKT-019, `StorageService` (TKT-016), fitur web yang sudah ada.

## Langkah-langkah

1. **Api** di modul `certificates`: list + detail + download. Respons item: `{ id, number, status,
isActive, issuedAt, member: { id, memberNumber, name }, exam: { id, name, type, date },
grade: { belt, kyu, dan } (tingkatan hasil dari GradeHistory peserta), hasPdf, hasPng }`.
   Nama file unduhan: `<nomor-sertifikat>.pdf|png` (tanpa nama member).
2. Test api: download sertifikat `PENDING` ditolak 409, `READY` mengembalikan URL dari
   `StorageService` (mock), filter list.
3. **Web** `src/features/certificates`: tipe + label status (`PENDING: 'Diproses'`,
   `READY: 'Siap'`, `FAILED: 'Gagal'`), api files, `certificate-table.tsx` (dumb + test),
   container list dengan filter di URL, dialog konfirmasi terbit ulang ("Nomor lama akan
   dinonaktifkan").
4. Unduh: panggil endpoint download, lalu buka `url` (`window.location.assign` atau anchor
   `download`). Jangan menyimpan URL presigned di cache Query lebih lama dari TTL
   (`staleTime: 0`, `gcTime` pendek) atau ambil saat klik saja.
5. Status `PENDING` di-polling ringan (`refetchInterval` 5 detik) **hanya** selama ada baris
   `PENDING` di layar.
6. Tambahkan di fitur `exams` (detail ujian Selesai) daftar sertifikat peserta + tombol backfill,
   dan di fitur `members` (detail member) daftar sertifikat member. Masing-masing lewat fungsi API
   miliknya sendiri.

## Jangan lakukan

- Jangan membangun URL MinIO di web; selalu minta URL presigned ke api.
- Jangan polling terus-menerus tanpa syarat.
- Jangan menampilkan sertifikat nonaktif sebagai yang utama; tampilkan dengan label "Tidak aktif".

## Best practice

- Tombol unduh nonaktif dengan keterangan saat status bukan `READY`.
- Jumlah request kecil: list sudah memuat data yang dibutuhkan tabel.

## Kriteria selesai

- [ ] Admin bisa melihat, memfilter, dan mengunduh sertifikat `READY` (PDF dan PNG).
- [ ] Terbit ulang, retry, dan backfill berjalan dari web.
- [ ] Detail ujian dan detail member menampilkan sertifikat terkait.
- [ ] Test lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
pnpm --filter @karate/web check
pnpm check && pnpm format:check
```

## Catatan

- Sebelum TKT-019 selesai semua sertifikat akan tetap `PENDING`; bagian unduh diuji dengan
  memasang `READY` + file dummy secara manual di database/MinIO lokal.

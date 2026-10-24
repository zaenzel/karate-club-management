# TKT-014: Fitur event ujian (web)

| Field           | Nilai            |
| --------------- | ---------------- |
| Area            | web              |
| Prioritas       | P0               |
| Ukuran          | M                |
| Status          | Review           |
| Bergantung pada | TKT-005, TKT-011 |
| Membuka         | TKT-015          |
| Asumsi terkait  | -                |

## Konteks

Admin membuat event ujian, mengatur penguji, lalu memulai ujian. Peserta dan hasil dikerjakan di
TKT-015 pada halaman detail ujian yang dibuat di tiket ini.

## Tujuan

Admin bisa melihat daftar ujian, membuat/mengubah/menghapus event, mengatur penguji, dan memulai
ujian.

## Scope

### Termasuk

- Fitur `src/features/exams`.
- Halaman `/exams`, `/exams/new`, `/exams/[id]` (detail: info event, penguji, ringkasan, tombol
  aksi), `/exams/[id]/edit`.
- Dropdown cabang penyelenggara lewat fungsi API milik fitur `exams`.

### Tidak termasuk

- Tabel peserta, pembayaran, hasil, tombol tutup ujian (TKT-015). Sediakan area kosong di detail.

## Bacaan wajib

- `apps/web/AGENTS.md`, fitur `branches` dan `members` (pola yang disetujui), kontrak api TKT-011.

## Langkah-langkah

1. `types/exam.ts`: `Exam`, `ExamType`, `ExamStatus`, label Indonesia
   (`KYU: 'Ujian kyu'`, `DAN: 'Ujian dan'`; `DRAFT: 'Draf'`, `ONGOING: 'Berlangsung'`,
   `FINISHED: 'Selesai'`), `ExamListParams`.
2. `api/`: query keys + `get-exams`, `get-exam`, `create-exam`, `update-exam`, `delete-exam`,
   `update-examiners`, `start-exam`, `get-branch-options`.
3. `schemas/exam-schema.ts` (nama, jenis, tanggal, tempat, biaya default ≥ 0, cabang opsional) dan
   `schemas/examiners-schema.ts` (1-10 penguji, nama wajib, maksimal satu ketua). Test keduanya.
4. Komponen dumb + test: `exam-table.tsx` (Nama, Jenis, Tanggal, Tempat, Status badge, Peserta),
   `exam-filters.tsx` (status, jenis, cabang), `exam-form.tsx`, `examiners-editor.tsx` (daftar
   dinamis dengan `useFieldArray`, pilihan ketua berupa radio), `exam-summary.tsx`.
5. Containers: list, create, edit, detail. Di detail:
   - tombol "Ubah" dan "Hapus" mengikuti aturan status (hapus hanya Draf, ubah tidak untuk
     Selesai);
   - tombol "Mulai ujian" hanya untuk Draf, dengan dialog konfirmasi; pesan 409 dari api
     (misal belum ada penguji/peserta) tampil.
6. Format biaya rupiah dengan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR',
maximumFractionDigits: 0 })`, tanggal locale `id-ID`.
7. Halaman tipis di `src/app/(dashboard)/exams/...`.

## Jangan lakukan

- Jangan membuat dropdown untuk mengubah status langsung.
- Jangan import fitur lain.
- Jangan menyembunyikan aturan status hanya di web; web hanya menyembunyikan tombol, api tetap
  memutuskan.

## Best practice

- Aturan tampil tombol diletakkan di satu helper (`types/exam.ts` atau `lib` fitur) yang meniru
  `exam-status.ts` api, dengan test.
- Setelah mutation, invalidate list dan detail ujian terkait.

## Kriteria selesai

- [ ] Daftar ujian dengan filter berjalan.
- [ ] Event bisa dibuat, diubah, dihapus sesuai status; penguji bisa diatur dengan satu ketua.
- [ ] Tombol "Mulai ujian" berjalan dan error api tampil.
- [ ] Test lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/web check
pnpm check && pnpm format:check
```

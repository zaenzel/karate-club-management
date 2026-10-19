# TKT-018: Baris sertifikat, penomoran, dan terbit ulang (api)

| Field           | Nilai                     |
| --------------- | ------------------------- |
| Area            | api                       |
| Prioritas       | P0                        |
| Ukuran          | M                         |
| Status          | Todo                      |
| Bergantung pada | TKT-013, TKT-017          |
| Membuka         | TKT-019, TKT-020, TKT-021 |
| Asumsi terkait  | A10                       |

## Konteks

Sertifikat dibuat otomatis untuk peserta yang lulus setelah ujian selesai. Setiap sertifikat
punya nomor unik yang tercetak. Penerbitan ulang membuat sertifikat baru dan menonaktifkan yang
lama: **satu sertifikat aktif per peserta ujian**. Render file dikerjakan terpisah (TKT-019);
tiket ini hanya membuat dan mengelola **baris** sertifikat berstatus `PENDING`.

## Tujuan

Saat ujian ditutup, baris sertifikat `PENDING` dibuat untuk setiap peserta lulus memakai template
aktif. Admin bisa menerbitkan ulang. Ujian yang sudah selesai sebelum template ada bisa
"disusulkan".

## Scope

### Termasuk

- Modul `src/certificates/` (module, service, controller, dto, spec).
- Handler `ExamFinishedHandler` (dari TKT-013) yang membuat sertifikat di dalam transaksi tutup
  ujian.
- Generator nomor sertifikat.
- `POST /api/certificates/:id/reissue`.
- `POST /api/exams/:examId/certificates/backfill` (buat sertifikat untuk peserta lulus yang belum
  punya sertifikat aktif).
- Antarmuka `CertificateRenderQueue` dengan implementasi sementara (no-op yang hanya mencatat log
  level debug lewat Logger Nest), diganti di TKT-019.

### Tidak termasuk

- Render PDF/PNG (TKT-019).
- Endpoint daftar dan unduh untuk admin (TKT-020) dan publik (TKT-021).

## Bacaan wajib

- `docs/requirements.md` bagian Sertifikat, `docs/architecture.md` bagian Alur sertifikat, model
  `Certificate`, hook di TKT-013, README tiket Asumsi A10.

## Langkah-langkah

1. **Nomor sertifikat** `src/certificates/certificate-number.ts`: format `CYYYYNNNNN`, contoh
   `C202600001` (tahun terbit, urut per tahun, tanpa tanda hubung; A10 sudah dikonfirmasi), dibuat di dalam transaksi dengan pola sama seperti nomor
   anggota (TKT-008), termasuk retry saat bentrok unique. Test.
2. **Pembuatan** `CertificatesService.createForParticipants(tx, participantIds)`:
   - ambil template aktif; **jika tidak ada template aktif, jangan gagalkan tutup ujian**: lewati
     pembuatan dan biarkan backfill nanti (catat audit `certificate.skipped_no_template`);
   - untuk tiap peserta lulus tanpa sertifikat aktif: buat `Certificate { number, memberId,
examParticipantId, templateId, status: PENDING, isActive: true }`;
   - setelah transaksi berhasil commit, masukkan id sertifikat ke `CertificateRenderQueue`.
     Penting: antrian dipanggil **setelah** commit, bukan di dalam transaksi (kumpulkan id, lalu
     enqueue di service ujian setelah `$transaction` selesai, atau pakai mekanisme after-commit
     yang jelas).
3. Daftarkan handler ke hook `ExamFinishedHandler` milik modul ujian (TKT-013).
4. **Terbit ulang**: dalam transaksi, sertifikat lama `isActive = false`, buat baris baru dengan
   nomor baru, template aktif saat ini, status `PENDING`; enqueue setelah commit. Hanya untuk
   sertifikat yang saat ini aktif. Audit `certificate.reissue`.
5. **Backfill** untuk ujian `FINISHED`: buat sertifikat untuk peserta lulus yang belum punya
   sertifikat aktif. Idempoten: memanggil dua kali tidak membuat duplikat.
6. **Penjaga "satu aktif per peserta"**: skema tidak bisa mengekspresikannya, jadi:
   - semua jalur pembuatan mengecek di dalam transaksi;
   - tambahkan test untuk reissue berurutan dan backfill dua kali;
   - (opsional, disarankan) usulkan partial unique index
     `CREATE UNIQUE INDEX ... ON certificates (exam_participant_id) WHERE is_active` lewat migrasi
     baru. Karena ini perubahan skema/migrasi, tanyakan dulu ke user sebelum menambahkannya.
7. **Test**: tutup ujian tanpa template aktif tetap sukses dan tidak membuat sertifikat; dengan
   template membuat N sertifikat PENDING; reissue menonaktifkan yang lama; backfill idempoten;
   enqueue dipanggil setelah commit (bukan saat transaksi gagal).

## Jangan lakukan

- Jangan merender file di request HTTP.
- Jangan mengubah atau menghapus baris sertifikat lama saat terbit ulang (hanya `isActive = false`).
- Jangan membuat sertifikat untuk peserta tidak lulus.
- Jangan mengedit migrasi lama; perubahan index lewat migrasi baru setelah disetujui.

## Best practice

- Kumpulkan id yang perlu di-enqueue sebagai nilai balik transaksi supaya jelas kapan enqueue
  terjadi.
- Nama status konsisten dengan enum: `PENDING`, `READY`, `FAILED`.

## Kriteria selesai

- [ ] Tutup ujian dengan template aktif membuat satu sertifikat PENDING per peserta lulus.
- [ ] Tanpa template aktif, tutup ujian tetap berhasil; backfill membuat sertifikat belakangan.
- [ ] Terbit ulang menghasilkan nomor baru dan menonaktifkan yang lama.
- [ ] Tidak pernah ada dua sertifikat aktif untuk satu peserta (teruji).
- [ ] `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
pnpm check && pnpm format:check
```

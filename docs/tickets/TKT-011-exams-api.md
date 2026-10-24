# TKT-011: Modul event ujian dan penguji (api)

| Field           | Nilai            |
| --------------- | ---------------- |
| Area            | api              |
| Prioritas       | P0               |
| Ukuran          | M                |
| Status          | Review           |
| Bergantung pada | TKT-006          |
| Membuka         | TKT-012, TKT-014 |
| Asumsi terkait  | -                |

## Konteks

Ujian kenaikan tingkat adalah event: nama, jenis (**KYU** atau **DAN**), tanggal, tempat, biaya
default, penguji, dan cabang penyelenggara opsional (kosong = pengurus pusat). Status event:
`DRAFT` → `ONGOING` → `FINISHED`. Penguji ditulis sebagai nama (bukan akun), satu atau lebih, satu
boleh ditandai ketua penguji.

Tiket ini hanya mengurus **event dan penguji** serta transisi `DRAFT → ONGOING`. Peserta dan hasil
ada di TKT-012, penutupan (`→ FINISHED`) di TKT-013.

## Tujuan

CRUD event ujian dan pengelolaan daftar penguji, dengan aturan status yang jelas.

## Scope

### Termasuk

- `GET /api/exams` (pagination; filter `status`, `type`, `branchId`, rentang `dateFrom`/`dateTo`;
  urut tanggal menurun).
- `GET /api/exams/:id` (detail + penguji + ringkasan jumlah peserta, lulus, tidak lulus, belum
  dinilai).
- `POST /api/exams`, `PATCH /api/exams/:id`, `DELETE /api/exams/:id`.
- `PUT /api/exams/:id/examiners` (ganti seluruh daftar penguji sekaligus).
- `POST /api/exams/:id/start` (`DRAFT` → `ONGOING`).

### Tidak termasuk

- Peserta, biaya per peserta, hasil (TKT-012).
- Menutup ujian (TKT-013).

## Bacaan wajib

- `docs/requirements.md` bagian Ujian kenaikan tingkat, model `Exam` dan `ExamExaminer`, pola modul
  api (TKT-006).

## Langkah-langkah

1. **Aturan status murni** `src/exams/exam-status.ts`:
   - `canEdit(status)`: hanya `DRAFT` dan `ONGOING` (event `FINISHED` terkunci).
   - `canDelete(status)`: hanya `DRAFT`.
   - `canStart(status)`: hanya `DRAFT`.
   - `canChangeType(status, participantCount)`: hanya `DRAFT` dan tanpa peserta.
   - Test semua kombinasi.
2. **DTO**: `name` 3-150, `type` `KYU`|`DAN`, `date` `YYYY-MM-DD`, `location` wajib, `baseFee`
   bilangan bulat ≥ 0 (rupiah, tanpa desimal), `branchId` uuid opsional/null. `examiners` (untuk
   endpoint PUT): array 1 sampai 10 item `{ name, isChief }`, nama wajib, **maksimal satu**
   `isChief = true`.
3. **Service**:
   - create: cabang (jika diisi) harus ada; status selalu `DRAFT` (abaikan status dari body).
   - update: tolak 409 bila `!canEdit`; perubahan `type` tunduk ke `canChangeType`. Ubah `baseFee`
     **tidak** mengubah `fee` peserta yang sudah terdaftar (tulis di komentar).
   - delete: tolak 409 bila `!canDelete`; peserta dan penguji ikut terhapus (cascade di skema).
   - examiners: dalam transaksi, hapus semua lalu buat ulang; tolak bila event `FINISHED`.
   - start: tolak bila `!canStart`; boleh tanpa peserta? **Tidak**: minimal satu penguji dan satu
     peserta harus ada (409 dengan pesan yang menyebut kekurangannya). Karena modul peserta belum
     ada, cek jumlah peserta lewat Prisma langsung.
   - audit untuk create, update, delete, start, examiners.
4. Respons: `{ id, name, type, date, location, baseFee, status, branch: {id, name} | null,
examiners: [{ id, name, isChief }], stats: { participants, passed, failed, pending } }`.
5. **Test** service: create selalu DRAFT, update event FINISHED ditolak, delete ONGOING ditolak,
   dua ketua penguji ditolak, start tanpa penguji ditolak.

## Jangan lakukan

- Jangan membuat endpoint untuk mengubah status sembarang (`PATCH { status }`). Transisi hanya
  lewat endpoint aksi (`start`, nanti `finish`).
- Jangan membuat akun pengguna untuk penguji.
- Jangan menambahkan syarat absensi atau durasi latihan.
- Jangan menyimpan biaya sebagai float.

## Best practice

- Pesan error menyebut status saat ini, contoh: `Ujian berstatus Selesai tidak bisa diubah`.
- Fungsi status dipakai ulang oleh TKT-012 dan TKT-013; export dengan nama yang jelas.

## Kriteria selesai

- [ ] CRUD event dan penggantian penguji berjalan dengan aturan status di atas.
- [ ] Maksimal satu ketua penguji.
- [ ] `start` hanya dari DRAFT dan butuh minimal satu penguji dan satu peserta.
- [ ] Test lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
pnpm check && pnpm format:check
```

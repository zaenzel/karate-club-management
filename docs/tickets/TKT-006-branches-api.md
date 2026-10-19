# TKT-006: Modul cabang (api)

| Field           | Nilai                     |
| --------------- | ------------------------- |
| Area            | api                       |
| Prioritas       | P0                        |
| Ukuran          | S                         |
| Status          | Todo                      |
| Bergantung pada | TKT-004                   |
| Membuka         | TKT-007, TKT-008, TKT-011 |
| Asumsi terkait  | -                         |

## Konteks

Cabang adalah master data pertama. Member wajib punya cabang asal, dan ujian boleh punya cabang
penyelenggara. Model `Branch` sudah ada di skema: `code` (unik), `name`, `city`, `address?`,
`phone?`, `headCoachId?` (relasi ke `Member` bertipe coach).

Modul ini juga menjadi **contoh pertama** pola modul domain di api, jadi kerapian lebih penting
daripada kecepatan.

## Tujuan

CRUD cabang lewat REST, terproteksi auth, dengan validasi dan test.

## Scope

### Termasuk

- `GET /api/branches` (pagination, pencarian `q` pada kode/nama/kota, urut nama).
- `GET /api/branches/:id` (termasuk ringkasan kepala cabang dan jumlah member).
- `POST /api/branches`, `PATCH /api/branches/:id`, `DELETE /api/branches/:id`.
- `GET /api/branches/options` (daftar ringkas `{ id, code, name }` tanpa pagination, untuk
  dropdown).

### Tidak termasuk

- UI (TKT-007).
- Memilih kepala cabang sebelum modul member ada. Field `headCoachId` divalidasi di sini, tetapi
  pengujian dengan data member sungguhan boleh menunggu TKT-008.

## Bacaan wajib

- `docs/requirements.md` bagian Cabang, model `Branch` di skema, `apps/api/README.md` (pola dari
  TKT-003 dan TKT-004), README tiket bagian Kontrak HTTP.

## Langkah-langkah

1. Buat `src/branches/` dengan `branches.module.ts`, `branches.controller.ts`,
   `branches.service.ts`, `dto/create-branch.dto.ts`, `dto/update-branch.dto.ts`,
   `dto/list-branches.query.ts`. Daftarkan modul di `AppModule`.
2. **Schema Zod**:
   - `code`: wajib, di-trim, huruf besar otomatis, 2 sampai 20 karakter, hanya huruf, angka, dan
     tanda `-`.
   - `name`: wajib, 2 sampai 100 karakter. `city`: wajib, 2 sampai 100.
   - `address`, `phone`: opsional; string kosong diubah menjadi `null`. `phone` hanya angka,
     spasi, `+`, `-`.
   - `headCoachId`: opsional, uuid atau `null`.
   - Update memakai `.partial()` dari schema create.
3. **Service**:
   - list: `skip/take` dari pagination, `where` OR `contains` (`mode: 'insensitive'`) untuk `q`,
     dan `count` dengan `where` yang sama; kembalikan lewat `toPaginated()`.
   - create/update: jika `headCoachId` diisi, pastikan member itu ada **dan bertipe `COACH`**;
     jika tidak, 409 `Kepala cabang harus member bertipe coach`. Kode duplikat ditangani filter
     Prisma (409).
   - delete: tolak dengan 409 jika cabang masih punya member atau ujian
     (`Cabang masih dipakai oleh member atau ujian`).
4. Respons item: `{ id, code, name, city, address, phone, headCoach: { id, name } | null,
memberCount, createdAt, updatedAt }` untuk detail; list boleh tanpa `memberCount` bila
   memberatkan query (putuskan dan tulis di komentar).
5. Catat create/update/delete ke `AuditService` (`branch.create`, dll) dengan `before`/`after`.
6. **Test** (`branches.service.spec.ts`, Prisma tiruan): list dengan `q` dan pagination, create
   sukses, kepala cabang bukan coach ditolak, delete ditolak saat masih dipakai, delete sukses.
   Test schema: kode dinormalisasi huruf besar, string kosong menjadi `null`.

## Jangan lakukan

- Jangan menghapus cabang secara cascade beserta member.
- Jangan menambah field yang tidak ada di requirements (misal email cabang, logo).
- Jangan memakai `@Public()` di controller ini.

## Best practice

- Controller tipis: parse input dengan pipe, panggil service, kembalikan hasil.
- Pemetaan entity ke respons di satu fungsi (`toBranchResponse`) supaya bentuknya konsisten.

## Kriteria selesai

- [ ] Kelima endpoint + `options` jalan dan hanya bisa diakses saat login.
- [ ] Kode cabang unik dan dinormalisasi huruf besar.
- [ ] Kepala cabang non-coach ditolak; cabang yang dipakai tidak bisa dihapus.
- [ ] Test service dan schema lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
# manual: login dulu (lihat TKT-004), lalu
curl -b /tmp/c.txt -H 'Content-Type: application/json' \
  -d '{"code":"jkt-01","name":"Jakarta Pusat","city":"Jakarta"}' http://localhost:4000/api/branches
curl -b /tmp/c.txt 'http://localhost:4000/api/branches?q=jak'
pnpm check && pnpm format:check
```

# TKT-016: Modul storage MinIO/S3 (api)

| Field           | Nilai                     |
| --------------- | ------------------------- |
| Area            | api                       |
| Prioritas       | P0                        |
| Ukuran          | S                         |
| Status          | Todo                      |
| Bergantung pada | TKT-003                   |
| Membuka         | TKT-017, TKT-019, TKT-021 |
| Asumsi terkait  | -                         |

## Konteks

File desain template (PDF A4), gambar tanda tangan ketua, dan hasil render sertifikat (PDF + PNG)
disimpan di MinIO lokal (S3-compatible). Di server nanti bisa diganti Cloudflare R2/S3 cukup
dengan mengganti env `S3_*`. Web tidak mengakses storage langsung; unduhan memakai **URL bertanda
tangan** (presigned) yang kedaluwarsa singkat.

## Tujuan

`StorageService` di api untuk upload, ambil, hapus, dan membuat presigned URL, dikonfigurasi dari
env yang sudah ada di `.env.example`.

## Scope

### Termasuk

- Env `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` divalidasi di
  `loadEnv()`; tambah `S3_FORCE_PATH_STYLE` (default `true`, MinIO butuh path style) dan
  `S3_PRESIGN_TTL_SECONDS` (default 300).
- `src/storage/storage.module.ts` (global) + `storage.service.ts`.
- Konvensi nama key file.

### Tidak termasuk

- Endpoint upload (dibuat di tiket pemakainya, TKT-017).
- Antrian atau worker.

## Bacaan wajib

- `docs/architecture.md` (File storage, Jalur scaling), `.env.example`, `docker-compose.yml`
  (service `minio`, `minio-init`).

## Langkah-langkah

1. Pasang `@aws-sdk/client-s3` dan `@aws-sdk/s3-request-presigner` di `apps/api`.
2. Tambah env ke schema `loadEnv()` + `env.spec.ts`; tambah dua env baru ke `.env.example` dengan
   komentar.
3. `StorageService` dengan method:
   - `putObject(key, body: Buffer, contentType)`,
   - `getObject(key): Promise<Buffer>`,
   - `deleteObject(key)`,
   - `getPresignedDownloadUrl(key, { filename?, ttlSeconds? })` yang mengeset
     `ResponseContentDisposition: attachment; filename="..."`,
   - `exists(key)`.
4. **Konvensi key** (tulis di `apps/api/README.md`):
   - `templates/<templateId>/design.pdf`, `templates/<templateId>/signature.png`,
   - `certificates/<tahun>/<certificateId>.pdf` dan `.png`.
     Key tidak boleh memuat nama member atau data pribadi lain.
5. Presigned URL harus bisa dibuka dari browser. Karena `S3_ENDPOINT` lokal `http://localhost:9000`,
   URL yang dihasilkan langsung bisa diakses. Tambah env opsional `S3_PUBLIC_ENDPOINT` hanya jika
   endpoint internal dan publik berbeda (catat di README; boleh tidak diimplementasikan sekarang).
6. Test unit dengan client S3 tiruan (mock `send`): key dan content type diteruskan benar,
   presigned URL memakai TTL default, error "NoSuchKey" diubah menjadi `NotFoundException`.
7. Uji manual: skrip kecil atau test e2e opsional yang upload file teks ke MinIO lokal, membuat
   presigned URL, dan mengunduhnya dengan `curl`.

## Jangan lakukan

- Jangan membuat bucket publik atau mengubah policy bucket menjadi public-read.
- Jangan mengembalikan kredensial S3 ke web.
- Jangan menyimpan file di filesystem lokal api sebagai pengganti storage.
- Jangan menambah Redis atau service lain ke compose.

## Best practice

- Satu instance `S3Client` di modul.
- Content type eksplisit: `application/pdf`, `image/png`.

## Kriteria selesai

- [ ] Env S3 divalidasi; dua env baru ada di `.env.example`.
- [ ] `StorageService` bisa upload, unduh, hapus, dan membuat presigned URL ke MinIO lokal.
- [ ] Konvensi key terdokumentasi.
- [ ] Test lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
pnpm check && pnpm format:check
```

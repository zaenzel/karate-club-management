# TKT-001: Verifikasi infra lokal dan Prisma

| Field           | Nilai            |
| --------------- | ---------------- |
| Area            | infra / db       |
| Prioritas       | P0               |
| Ukuran          | S                |
| Status          | Review           |
| Bergantung pada | -                |
| Membuka         | TKT-002, TKT-003 |
| Asumsi terkait  | -                |

## Konteks

Kerangka repo sudah dibuat dan lolos lint, typecheck, test, dan build di salinan test. Yang
**belum pernah dijalankan** di laptop developer: `docker compose up`, `prisma generate`,
`prisma migrate`, dan `prisma db seed`. Saat ini `git init -b main` sudah dilakukan tetapi belum ada
commit, `node_modules` sudah ada, dan file `.env` belum dibuat. Folder migrasi
(`packages/db/prisma/migrations`) juga belum ada.

## Tujuan

Infra lokal (PostgreSQL + MinIO) berjalan, migrasi pertama bernama `init` tercipta dari skema saat
ini, seed 6 warna sabuk masuk, dan api + web bisa dijalankan.

## Scope

### Termasuk

- Membuat `.env` dari `.env.example`.
- Menjalankan infra, generate Prisma Client, migrasi `init`, dan seed.
- Memperbaiki error **setup** yang muncul (versi, path, konfigurasi), dengan perubahan sekecil
  mungkin.
- Menjalankan `pnpm check` dan `pnpm format:check`.

### Tidak termasuk

- Mengubah isi skema (model, field, relasi). Jika skema perlu diubah, buat catatan dan tanyakan
  dulu.
- Memindahkan dotfiles dan commit pertama (itu TKT-002).
- Menyambungkan api ke database (itu TKT-003).

## Bacaan wajib

- `AGENTS.md` (root), `packages/db/README.md`, `docker-compose.yml`, `.env.example`,
  `packages/db/prisma.config.ts`, `packages/db/prisma/seed.ts`.

## Langkah-langkah

1. Pastikan Node sesuai `.nvmrc` (`node -v`) dan pnpm 10 (`pnpm -v`). Docker dan Docker Compose v2
   terpasang (`docker compose version`).
2. Dari root: `pnpm install`. Harus selesai tanpa error. Jika husky mengeluh karena belum ada commit,
   itu wajar; catat saja.
3. `cp .env.example .env`. Jangan ubah nilai kecuali port bentrok di laptop (lihat langkah 4).
4. `pnpm infra:up`. Cek `docker compose ps`: `postgres` dan `minio` berstatus `healthy`,
   `minio-init` sudah `exited (0)`. Jika port 5433, 9000, atau 9001 dipakai aplikasi lain, ubah
   variabel port di `.env` (bukan di `docker-compose.yml`) dan sesuaikan `DATABASE_URL` /
   `S3_ENDPOINT`.
5. Buka MinIO console `http://localhost:9001` (login `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`),
   pastikan bucket `karate-files` ada.
6. `pnpm db:generate`. Hasilnya di `packages/db/src/generated/prisma` (di-ignore git).
7. `pnpm db:migrate`, beri nama `init`. Hasilnya folder
   `packages/db/prisma/migrations/<timestamp>_init/migration.sql` dan `migration_lock.toml`.
   Folder ini **wajib di-commit** nanti (TKT-002).
8. `pnpm db:seed`. Harus mencetak `Seed selesai: 6 warna sabuk.` Jalankan sekali lagi untuk
   memastikan seed idempotent (tidak error, tetap 6 baris).
9. `pnpm db:studio` dan cek tabel `belts` berisi 6 baris berurutan Putih sampai Hitam. Tutup lagi.
10. `pnpm dev:api`, buka `http://localhost:4000/api/health`, harus `{"status":"ok"}`. Hentikan.
11. `pnpm dev:web`, buka `http://localhost:3000`, halaman beranda tampil. Hentikan.
12. Dari root: `pnpm check` lalu `pnpm format:check`. Perbaiki sampai lolos.
13. Jika ada perbaikan setup, tulis ringkasannya di `packages/db/README.md` atau `README.md` root
    (bagian yang relevan), supaya developer berikutnya tidak mengulang masalah yang sama.

## Jangan lakukan

- Jangan `prisma migrate reset` atau `prisma db push` sebagai jalan pintas.
- Jangan commit `.env`, `packages/db/src/generated`, atau volume Docker.
- Jangan mengubah nama migrasi `init` setelah dibuat, dan jangan mengedit `migration.sql` manual.
- Jangan menambah service baru (Redis, dll) ke `docker-compose.yml`.
- Jangan upgrade versi paket besar (Prisma, Next, Nest) untuk "memperbaiki" error tanpa
  menanyakan dulu.

## Best practice

- Satu masalah, satu perbaikan kecil. Catat apa error-nya dan kenapa perbaikannya benar.
- Jika `prisma generate` gagal mengunduh engine (pernah terjadi di sandbox), cek koneksi/proxy
  dulu sebelum mengubah konfigurasi.

## Kriteria selesai

- [x] `docker compose ps` menunjukkan postgres dan minio healthy, bucket `karate-files` ada.
- [x] Folder migrasi `*_init` ada dan berisi semua tabel di skema.
- [x] Tabel `belts` berisi 6 warna; seed bisa dijalankan ulang tanpa error.
- [x] `GET /api/health` mengembalikan `{"status":"ok"}`; web tampil di port 3000.
- [x] `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
docker compose ps
pnpm db:generate && pnpm db:seed
curl -s http://localhost:4000/api/health   # saat pnpm dev:api berjalan
pnpm check
pnpm format:check
```

## Catatan

- Port lokal: web 3000, api 4000, PostgreSQL 5433, MinIO 9000 (API) dan 9001 (console).

# Karate Club Management

Aplikasi web untuk mengelola klub karate dengan banyak cabang: data member (coach dan student),
ujian kenaikan sabuk, dan sertifikat yang bisa diunduh sebagai PDF atau PNG.

Kebutuhan produk: [`docs/requirements.md`](docs/requirements.md) · Arsitektur:
[`docs/architecture.md`](docs/architecture.md) · Aturan untuk developer dan AI agent:
[`AGENTS.md`](AGENTS.md).

## Prasyarat

Node.js 22 (`.nvmrc`), pnpm 10, Docker (untuk PostgreSQL dan MinIO).

## Menjalankan secara lokal

```bash
git init -b main          # sekali, agar husky (lint saat commit) terpasang
pnpm install
cp .env.example .env      # nilai default sudah cocok untuk lokal
pnpm infra:up             # PostgreSQL (port 5433) + MinIO (9000/9001)
pnpm db:generate          # buat Prisma Client
pnpm db:migrate           # beri nama migrasi pertama, mis. "init"
pnpm db:seed              # isi 6 warna sabuk

pnpm dev:api              # terminal 1: http://localhost:4000/api/health
pnpm dev:web              # terminal 2: http://localhost:3000
```

Web saat ini masih memakai mock API bawaan fe-template (contoh fitur Produk). Sambungkan ke api
dengan mengubah `NEXT_PUBLIC_API_URL` di `apps/web/.env.local` bila endpoint-nya sudah ada.

## Struktur

| Folder        | Isi                                                                    |
| ------------- | ---------------------------------------------------------------------- |
| `apps/web`    | Frontend Next.js 16, struktur feature-based (hasil dari `fe-template`) |
| `apps/api`    | Backend NestJS 12                                                      |
| `packages/db` | Skema Prisma, migrasi, seed                                            |
| `docs`        | Kebutuhan produk dan keputusan arsitektur                              |

## Perintah umum

| Perintah          | Fungsi                                        |
| ----------------- | --------------------------------------------- |
| `pnpm check`      | lint + typecheck + test semua workspace       |
| `pnpm format`     | Prettier semua workspace                      |
| `pnpm build`      | build semua workspace                         |
| `pnpm infra:down` | matikan PostgreSQL dan MinIO (data tetap ada) |
| `pnpm db:studio`  | lihat data di Prisma Studio                   |

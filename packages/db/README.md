# @karate/db

Skema Prisma 7 (PostgreSQL), migrasi, dan seed. Skema fase 1 ada di `prisma/schema.prisma`.

```bash
# dari root repo
pnpm infra:up         # PostgreSQL + MinIO
pnpm db:generate      # buat Prisma Client ke src/generated/prisma (tidak di-commit)
pnpm db:migrate       # migrasi pertama: beri nama, mis. "init"
pnpm db:seed          # isi 6 warna sabuk
pnpm db:studio        # lihat data
```

Catatan:

- Port bentrok (mis. MinIO lain di 9000/9001): ubah `MINIO_API_PORT`, `MINIO_CONSOLE_PORT`, dan
  `S3_ENDPOINT` di `.env`, bukan di `docker-compose.yml`.
- `pnpm db:migrate` meminta nama migrasi secara interaktif. Tanpa terminal interaktif jalankan
  `pnpm --filter @karate/db exec prisma migrate dev --name <nama>`; jangan memakai `--` setelah
  `pnpm db:migrate` karena proses menggantung dan menahan advisory lock database.
- Bila `minio-init` gagal karena image `minio/mc` tidak bisa diunduh, buat bucket dengan `mc` di
  dalam container MinIO:
  `docker exec karate-club-minio-1 sh -c 'mc alias set local http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" && mc mb --ignore-existing local/karate-files'`.

- `DATABASE_URL` dibaca dari `.env` di root (`prisma.config.ts`).
- Prisma Client Prisma 7 memakai driver adapter (`@prisma/adapter-pg`), lihat `prisma/seed.ts`.
- Aturan bisnis yang tidak bisa diekspresikan di skema (hitam hanya bila kyu 0, kyu 0 sampai 10
  kelipatan 0.5, satu sertifikat aktif per peserta) ditegakkan di `apps/api`.

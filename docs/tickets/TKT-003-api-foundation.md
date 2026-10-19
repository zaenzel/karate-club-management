# TKT-003: Fondasi api (Prisma, validasi, error, pagination)

| Field           | Nilai                             |
| --------------- | --------------------------------- |
| Area            | api / db                          |
| Prioritas       | P0                                |
| Ukuran          | M                                 |
| Status          | Review                            |
| Bergantung pada | TKT-001                           |
| Membuka         | TKT-004, TKT-016, semua modul api |
| Asumsi terkait  | -                                 |

## Konteks

`apps/api` baru punya `GET /api/health`. Semua modul domain berikutnya butuh hal yang sama: akses
database lewat Prisma, validasi body/query dengan Zod, format error yang konsisten, dan helper
pagination. Tiket ini membangun fondasi itu **sekali**, supaya setiap modul tinggal mengikuti pola.

Masalah teknis yang harus diselesaikan: Prisma Client dibuat di `packages/db/src/generated/prisma`
(TypeScript), sedangkan api dijalankan sebagai ESM hasil `nest build`. Api harus bisa memakai client
itu baik saat `pnpm dev:api` maupun saat `pnpm build` + `node dist/main`.

## Tujuan

Api tersambung ke PostgreSQL lewat `PrismaService`, punya `ZodValidationPipe`, filter error
terpusat, dan helper pagination, semuanya dengan test dan contoh pemakaian yang bisa ditiru modul
lain.

## Scope

### Termasuk

- `packages/db`: entry point publik (`src/index.ts`) yang mengekspor Prisma Client, tipe, enum, dan
  fungsi pembuat client dengan adapter `PrismaPg`. `package.json` diberi `exports` dan, bila perlu,
  langkah build.
- `apps/api`: dependency `@karate/db` (workspace), env `DATABASE_URL` di `loadEnv()`,
  `PrismaModule` global + `PrismaService` (connect saat init, disconnect saat shutdown).
- `src/common/`: `ZodValidationPipe`, exception filter untuk error Prisma umum, helper pagination
  (`paginationQuerySchema`, `toPaginated()`), helper konversi Decimal/tanggal.
- Health check diperluas: `GET /api/health` juga mengecek koneksi database (`SELECT 1`).
- `AuditService` sederhana untuk menulis `AuditLog` (dipakai tiket lain untuk aksi penting).

### Tidak termasuk

- Auth dan guard (TKT-004).
- Modul domain apa pun.
- Storage/MinIO (TKT-016).
- Membuat `packages/shared`.

## Bacaan wajib

- `docs/architecture.md` bagian Konvensi api, `apps/api/README.md`, `apps/api/src/main.ts`,
  `apps/api/src/config/env.ts` + test-nya, `packages/db/prisma/seed.ts` (contoh membuat client
  dengan adapter), `packages/db/package.json`, `apps/web/src/types/api.ts` (bentuk `Paginated`).
- README tiket bagian **Kontrak HTTP**.

## Langkah-langkah

1. **Entry point `packages/db`.** Buat `packages/db/src/index.ts` yang:
   - meng-export ulang isi `./generated/prisma/client.js` (PrismaClient, `Prisma`, enum, tipe
     model);
   - meng-export `createPrismaClient(connectionString: string)` yang mengembalikan
     `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`.
2. **Supaya bisa dipakai saat runtime.** Pilih salah satu dan dokumentasikan di
   `packages/db/README.md`:
   - (disarankan) build `packages/db` ke `dist/` dengan `tsc` (script `build`), lalu
     `package.json` memakai `"exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } }`.
     Tambahkan `build` ke urutan yang benar (root `pnpm build` sudah rekursif; pastikan
     `db:generate` dijalankan sebelum build). Pastikan `dist/` di-ignore git.
   - atau alternatif lain yang terbukti jalan untuk **dev, typecheck, test, dan build**.
     Apa pun pilihannya, `pnpm build` dari root lalu `node apps/api/dist/main.js` harus berjalan.
3. Ubah `seed.ts` hanya jika perlu supaya memakai `createPrismaClient` (opsional, jangan ubah
   perilakunya).
4. **Env.** Tambah `DATABASE_URL: z.string().min(1)` ke schema di `apps/api/src/config/env.ts`.
   Perbarui `env.spec.ts` (kasus valid dan tidak valid). `.env.example` sudah punya
   `DATABASE_URL`, tidak perlu diubah.
5. **PrismaModule.** `apps/api/src/prisma/prisma.module.ts` (`@Global()`) dan `prisma.service.ts`
   yang membungkus client dari `createPrismaClient(env.DATABASE_URL)`, memanggil `$connect` di
   `onModuleInit` dan `$disconnect` di `onModuleDestroy`. Aktifkan `app.enableShutdownHooks()` di
   `main.ts`. Cara env sampai ke service: buat provider konfigurasi (misal token `ENV`) yang nilainya
   hasil `loadEnv()`, jangan membaca `process.env` di service.
6. **Validasi.** `src/common/zod-validation.pipe.ts`: menerima schema Zod, mengembalikan data hasil
   parse, dan saat gagal melempar `BadRequestException` dengan body
   `{ message: 'Data tidak valid', errors: z.flattenError(err).fieldErrors }`. Test: data valid,
   tidak valid, dan coercion query string (`page=2` menjadi number).
7. **Pagination.** `src/common/pagination.ts`: `paginationQuerySchema` (`page` default 1,
   `pageSize` default 20 maksimal 100) dan `toPaginated(data, total, { page, pageSize })` yang
   menghasilkan `{ data, meta: { page, pageSize, total, totalPages } }`. Test perhitungan
   `totalPages` (0 data, pas, sisa).
8. **Error Prisma.** `src/common/prisma-exception.filter.ts`: ubah `P2002` (unique) menjadi 409
   dengan pesan Indonesia yang menyebut field, `P2025` (record not found) menjadi 404. Error lain
   biarkan ke handler bawaan. Daftarkan global di `main.ts`. Test unit untuk kedua kode.
9. **Konvensi status aturan bisnis.** Tetapkan: pelanggaran aturan bisnis memakai
   `ConflictException` (409) dengan pesan Indonesia. Tulis keputusan ini di
   `docs/architecture.md` bagian Konvensi api, dan perbarui README tiket bagian Kontrak HTTP bila
   perlu.
10. **Serializer.** `src/common/serialize.ts`: `toNumber(decimal)` dan `toDateOnly(date)` (hasil
    `YYYY-MM-DD`, aman zona waktu karena kolom `@db.Date`). Test termasuk tanggal 1 Januari dan
    31 Desember.
11. **Audit.** `src/audit/audit.module.ts` + `audit.service.ts` dengan
    `log({ userId, action, entity, entityId, before, after }, tx?)` yang bisa ikut transaksi.
    Test unit dengan Prisma tiruan.
12. **Health.** `HealthController` mengecek database dengan `SELECT 1`; balas
    `{ status: 'ok', database: 'up' }` atau 503 bila database mati. Perbarui test.
13. Perbarui `apps/api/README.md`: cara membuat modul baru (struktur folder, pemakaian pipe,
    pagination, filter, audit) dengan contoh singkat.

## Jangan lakukan

- Jangan membuat lebih dari satu instance `PrismaClient` di api.
- Jangan membaca `process.env` di luar `config/env.ts`.
- Jangan memakai `class-validator`/`class-transformer`; validasi pakai Zod.
- Jangan import kode `apps/api` atau `packages/db` dari `apps/web`.
- Jangan mengubah skema Prisma.
- Jangan membuat `packages/shared`.

## Best practice

- Ikuti gaya `env.ts` yang ada: komentar singkat bahasa Indonesia, fail fast.
- Test unit jangan butuh database: mock `PrismaService` dengan objek berisi fungsi yang dipakai.
- Buat helper sekecil mungkin; jangan membuat base class generik CRUD.

## Kriteria selesai

- [x] `pnpm dev:api` jalan dan `GET /api/health` mengembalikan `database: 'up'`; saat
      `docker compose stop postgres`, health mengembalikan 503.
- [x] `pnpm build` dari root berhasil dan `node apps/api/dist/main.js` jalan.
- [x] Pipe Zod, pagination, filter Prisma, serializer, dan audit punya test dan lolos.
- [x] `apps/api/README.md` dan `docs/architecture.md` diperbarui.
- [x] `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm db:generate
pnpm --filter @karate/api check
pnpm build && node apps/api/dist/main.js   # Ctrl+C setelah log listen
curl -s http://localhost:4000/api/health
pnpm check && pnpm format:check
```

## Catatan

- CI (`ci.yml`) memakai `DATABASE_URL` palsu; pastikan test tidak membuka koneksi database.

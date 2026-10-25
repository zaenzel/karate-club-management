# @karate/api

Backend NestJS 12 (ESM, vitest, oxlint). Berisi fondasi (Prisma, validasi Zod, error, pagination, audit) dan
`GET /api/health`. Modul domain ditambahkan per fitur (lihat `docs/requirements.md` di root).

```bash
pnpm dev:api     # dari root, http://localhost:4000/api/health
pnpm --filter @karate/api check
```

Aturan:

- Import relatif memakai ekstensi `.js` (`./app.module.js`), sesuai `module: nodenext`.
- Env dibaca lewat `loadEnv()` di `src/config/env.ts`, bukan `process.env` langsung.
- Satu modul NestJS per domain: `src/<domain>/<domain>.module.ts`, controller, service, DTO (Zod).
- Database lewat `PrismaService` (global): `this.prisma.client.member.findMany(...)`. Jangan membuat
  `PrismaClient` sendiri. `@karate/db` harus sudah di-build: `pnpm db:generate` melakukan generate
  dan build sekaligus.
- Dependency env: inject token `ENV` (`@Inject(ENV) env: Env`), jangan baca `process.env`.

## Membuat modul baru

```
src/branches/
├── branches.module.ts
├── branches.controller.ts
├── branches.service.ts
├── branches-rules.ts        aturan bisnis murni (diuji tanpa database)
├── dto/create-branch.dto.ts schema Zod + tipe
└── branches.service.spec.ts
```

Validasi body/query dengan `ZodValidationPipe`, list dengan pagination:

```ts
// dto/list-branches.dto.ts
export const listBranchesSchema = paginationQuerySchema.extend({ q: z.string().optional() });

// branches.controller.ts
@Get()
list(@Query(new ZodValidationPipe(listBranchesSchema)) query: ListBranchesQuery) {
  return this.branches.list(query);
}

// branches.service.ts
async list(query: ListBranchesQuery) {
  const [rows, total] = await this.prisma.client.$transaction([
    this.prisma.client.branch.findMany({ ...toSkipTake(query), orderBy: { name: 'asc' } }),
    this.prisma.client.branch.count(),
  ]);
  return toPaginated(rows, total, query);
}
```

- Error: `P2002` (unique) menjadi 409 dan `P2025` (tidak ditemukan) menjadi 404 otomatis lewat
  `PrismaExceptionFilter`. Pelanggaran aturan bisnis: `throw new ConflictException('pesan Indonesia')`.
- Serialisasi: `toNumber(decimal)` untuk kyu, `toDateOnly(date)` untuk kolom tanggal.
- Audit: impor `AuditModule`, inject `AuditService`, lalu
  `await this.audit.log({ userId, action, entity, entityId, before, after }, tx)`. Berikan `tx` dari
  `prisma.client.$transaction(async (tx) => ...)` agar log ikut transaksi.
- Test unit tidak boleh membuka koneksi database: tiru `PrismaService` dengan objek berisi fungsi
  yang dipakai (`{ client: { branch: { findMany: vi.fn() } } }`).

## Autentikasi

Semua endpoint otomatis terproteksi oleh `JwtAuthGuard` global, kecuali jika ditandai publik:

- Menandai endpoint publik: gunakan `@Public()` dari `./auth/public.decorator.js`.
  ```ts
  @Public()
  @Get('public-info')
  getPublicInfo() { ... }
  ```
- Mengambil info user yang sedang login: gunakan `@CurrentUser()` dari `./auth/current-user.decorator.js`.
  ```ts
  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
  ```
- Seed Super Admin pertama: jalankan `pnpm db:seed:admin` (atau `pnpm --filter @karate/api seed:admin`).

## File Storage (MinIO / S3)

Modul `StorageModule` (global) dan `StorageService` menangani upload, ambil, hapus, dan pembuatan presigned download URL.

### Konvensi Key Storage

Penyimpanan file mengikuti pola terstruktur:

- **Desain Template**: `templates/<templateId>/design.pdf`
- **Tanda Tangan Template**: `templates/<templateId>/signature.png`
- **Hasil Render Sertifikat**: `certificates/<tahun>/<certificateId>.pdf` dan `certificates/<tahun>/<certificateId>.png`

> **Aturan Keamanan & Privasi**: Key file tidak boleh memuat nama member, nomor anggota, atau data pribadi lainnya.

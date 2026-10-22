# AGENTS.md

Panduan untuk AI coding agent (Claude Code, Codex, Cursor, Copilot, Gemini, dll) dan developer di
repo ini. **Baca file ini dulu**, lalu `docs/requirements.md` (apa yang dibangun) dan aturan folder
yang Anda kerjakan.

## Proyek

Aplikasi web manajemen klub karate dengan banyak cabang. Fase 1: data cabang, member (coach dan
student), ujian kenaikan sabuk (kyu dan dan), sertifikat PDF/PNG, dan halaman download sertifikat
publik. Bahasa UI: **Indonesia**. Nama variabel, fungsi, dan file: **Inggris**.

## Monorepo

```
apps/
├── web/        Next.js 16 (dari fe-template). Aturan lengkap: apps/web/AGENTS.md
└── api/        NestJS 12 (ESM). Aturan: apps/api/README.md
packages/
└── db/         Prisma 7 (PostgreSQL): schema, migrasi, seed
docs/           requirements.md (kebutuhan produk), architecture.md (keputusan teknis)
docker-compose.yml   PostgreSQL + MinIO untuk development lokal
```

Belum ada (sengaja ditunda, lihat `docs/architecture.md`): `apps/worker` (render sertifikat) dan
`packages/shared`. Jangan dibuat sebelum dibutuhkan.

## Perintah (dari root)

```bash
pnpm install            # jalankan `git init -b main` dulu agar husky terpasang
pnpm infra:up           # PostgreSQL + MinIO
pnpm db:generate        # Prisma Client (wajib sebelum typecheck/seed)
pnpm db:migrate         # migrasi dev
pnpm db:seed            # warna sabuk
pnpm db:seed:admin      # akun superadmin awal
pnpm dev:api            # http://localhost:4000/api/health
pnpm dev:web            # http://localhost:3000
pnpm check              # lint + typecheck + test semua workspace (jalankan sebelum selesai)
pnpm format             # Prettier semua workspace
```

Package manager: **pnpm** saja. Satu lockfile di root.

## Aturan lintas workspace

1. **Aturan domain ada di `docs/requirements.md`.** Jangan menebak aturan sabuk/kyu/ujian; jika
   dokumen belum menjawab, tanyakan ke user lalu perbarui dokumen.
2. **Skema database hanya diubah lewat `packages/db/prisma/schema.prisma` + migrasi.** Jangan edit SQL
   migrasi yang sudah dibuat.
3. **Aturan bisnis ditegakkan di `apps/api`**, bukan di web. Web hanya menampilkan dan memvalidasi
   untuk UX; validasi yang sah ada di server.
4. **Web tidak mengimpor kode dari `apps/api` atau `packages/db`.** Kontrak data lewat HTTP.
5. **Env baru**: tambahkan ke `.env.example` (root), validasi di `apps/api/src/config/env.ts` atau
   `apps/web/src/config/env.ts`.
6. **Jangan commit** `.env`, file hasil generate Prisma, atau file sertifikat/tanda tangan asli.
7. Commit mengikuti Conventional Commits (dijaga commitlint): `feat(api): tambah modul member`.

## Definition of done

1. `pnpm check` lolos dan `pnpm format:check` lolos.
2. Logika baru punya test (api: vitest; web: lihat `apps/web/docs/conventions.md`).
3. Tidak ada `console.log`, kode mati, atau TODO tanpa konteks.
4. Perubahan aturan domain atau arsitektur dicatat di `docs/`.

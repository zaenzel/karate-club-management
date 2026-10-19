# @karate/web

Frontend Karate Club Management: **Next.js 16 (App Router) · React 19 · TypeScript strict ·
Tailwind CSS v4 · TanStack Query · Zustand · React Hook Form + Zod**. Struktur feature-based dengan
aturan arsitektur yang dijaga ESLint. Berasal dari `fe-template`.

Ini bagian dari monorepo; setup lengkap ada di [README root](../../README.md).

## Menjalankan

Dari root repo:

```bash
pnpm dev:web          # http://localhost:3000
pnpm --filter @karate/web check   # lint + typecheck + test
```

Env: salin `.env.example` ke `.env.local` bila perlu mengubah nilai (default sudah jalan).

## Perintah (di dalam `apps/web`)

| Perintah         | Fungsi                       |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Dev server                   |
| `pnpm build`     | Production build             |
| `pnpm lint`      | ESLint + aturan arsitektur   |
| `pnpm typecheck` | Generate route types + `tsc` |
| `pnpm test`      | Unit/komponen test (Vitest)  |
| `pnpm test:e2e`  | E2E (Playwright)             |
| `pnpm check`     | lint + typecheck + test      |
| `pnpm format`    | Prettier                     |

E2E pertama kali: `pnpm exec playwright install chromium`.

## Struktur

```
src/
├── app/          routing saja (page tipis)
├── features/     logika bisnis per domain — contoh referensi: features/products
├── components/   ui/ (primitive), common/ (generik), layout/
├── hooks/        hook generik
├── lib/          api-client, query-client, utils
├── config/       env (tervalidasi), site config
├── providers/    provider global
├── types/        tipe global
├── styles/       design token Tailwind
└── mocks/        data mock (hapus saat api asli dipakai)
```

Fitur `products` hanyalah contoh pola. Hapus dan ganti dengan fitur domain (`branches`, `members`,
`exams`, `certificates`) mengikuti [`docs/adding-a-feature.md`](docs/adding-a-feature.md).

## Dokumentasi

- [`AGENTS.md`](AGENTS.md): aturan untuk developer dan AI agent
- [`docs/`](docs): arsitektur, konvensi, cara menambah fitur
- Kebutuhan produk: [`../../docs/requirements.md`](../../docs/requirements.md)

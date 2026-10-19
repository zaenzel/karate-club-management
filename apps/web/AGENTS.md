# AGENTS.md

Panduan untuk AI coding agent (Claude Code, Codex, Cursor, Copilot, Gemini, dll) dan developer
yang bekerja di repo ini. **Baca file ini sebelum menulis kode.** Detail ada di folder `docs/`.

> **Konteks monorepo:** ini adalah `apps/web` dari repo Karate Club Management. Aturan umum repo
> ada di `../../AGENTS.md`, kebutuhan produk di `../../docs/requirements.md`. Perintah `pnpm`
> di bawah dijalankan dari folder `apps/web` (atau `pnpm --filter @karate/web <perintah>` dari root).

## Ringkasan proyek

Template frontend berbasis **Next.js (App Router) + TypeScript strict**, dengan struktur
**feature-based**. Fitur `products` adalah contoh referensi lengkap — tiru polanya untuk fitur baru.

| Kebutuhan                          | Pakai                                     | Jangan pakai                                 |
| ---------------------------------- | ----------------------------------------- | -------------------------------------------- |
| Data dari server                   | TanStack Query (`useQuery`/`useMutation`) | `useEffect` + `fetch` manual                 |
| State UI global                    | Zustand (`features/*/stores`)             | Context untuk state yang sering berubah      |
| State yang bisa dibagikan via link | URL search params                         | Zustand                                      |
| Form                               | React Hook Form + Zod (`zodResolver`)     | `useState` per field                         |
| HTTP                               | `api` dari `@/lib/api-client` (axios)     | `fetch`/`axios` langsung di komponen         |
| Styling                            | Tailwind CSS v4 + token di `globals.css`  | CSS module, inline style, warna hex hardcode |
| Komponen dasar                     | `src/components/ui` (gaya shadcn/ui)      | Library UI lain tanpa diskusi                |
| Env variable                       | `env` dari `@/config/env`                 | `process.env.X` langsung                     |

## Perintah

```bash
pnpm dev           # dev server (http://localhost:3000)
pnpm lint          # ESLint, termasuk aturan arsitektur
pnpm typecheck     # next typegen + tsc
pnpm test          # unit test (Vitest)
pnpm test:e2e      # E2E (Playwright) — butuh `pnpm exec playwright install chromium` sekali
pnpm check         # lint + typecheck + test (jalankan sebelum selesai)
pnpm build         # production build
```

Package manager: **pnpm**. Jangan pakai npm/yarn, jangan commit lockfile lain.

## Peta folder

```
src/
├── app/                 ROUTING SAJA. page.tsx tipis, memanggil komponen dari features/.
│   ├── (dashboard)/     route group (tidak masuk URL), berbagi layout
│   └── api/             route handler. Saat ini berisi MOCK API untuk contoh.
├── features/<nama>/     LOGIKA BISNIS per domain
│   ├── api/             fungsi fetch + hook TanStack Query + query-keys.ts
│   ├── components/      komponen milik fitur (smart *-container.tsx & dumb)
│   ├── hooks/           hook khusus fitur
│   ├── schemas/         schema Zod (dipakai form & validasi API)
│   ├── stores/          store Zustand (state UI fitur)
│   ├── types/           tipe & konstanta domain
│   └── index.ts         PUBLIC API — satu-satunya pintu masuk dari luar
├── components/
│   ├── ui/              primitive (Button, Input, Card…). Wajib dumb.
│   ├── common/          komponen generik (EmptyState, ErrorState…). Wajib dumb.
│   └── layout/          Header, Sidebar, dll
├── hooks/               hook generik (useDebounce). Tidak tahu soal fitur.
├── lib/                 api-client, query-client, utils
├── config/              env.ts (validasi env), site.ts
├── providers/           provider global (QueryClientProvider, dll)
├── types/               tipe global (Paginated, ApiError)
├── styles/globals.css   design token Tailwind
└── mocks/               data mock. Hapus saat backend asli tersedia.
```

## Aturan WAJIB

Aturan bertanda 🔒 dijaga oleh ESLint (`pnpm lint` akan gagal).

1. 🔒 **Hanya `src/features/<fitur>/api/*` yang boleh memakai `axios` atau `@/lib/api-client`.**
   Komponen mendapat data lewat hook (`useProducts`) atau fungsi API (`getProducts`) dari fitur.
2. 🔒 **Dari luar fitur, import hanya lewat `@/features/<fitur>`** (index.ts). Jangan
   `@/features/products/components/...`.
3. 🔒 **Fitur tidak boleh import fitur lain.** Di dalam fitur, gunakan import relatif
   (`../api/get-products`). Kode yang dipakai bersama → pindahkan ke `components/`, `hooks/`, atau `lib/`.
4. 🔒 **Kode shared (`components`, `hooks`, `lib`, `providers`, `config`, `types`) tidak boleh
   import dari `features/`.**
5. **`app/**/page.tsx` harus tipis**: metadata, layout halaman, dan render container dari fitur.
   Tidak ada logika bisnis, tidak ada `useQuery` di page.
6. **Smart vs dumb**: komponen yang memanggil hook data/store diberi akhiran `-container.tsx`.
   Komponen lain menerima semua data lewat props. `components/ui` dan `components/common` selalu dumb.
7. **Semua query key dibuat dari `query-keys.ts`** milik fitur. Mutation wajib meng-invalidate key
   yang terdampak.
8. **Validasi pakai Zod**, satu schema dipakai bersama oleh form dan API.
9. **Tambahkan `'use client'` hanya jika perlu** (hook, event handler, browser API). Default-nya
   Server Component.
10. **Jangan mengubah file di `components/ui/` untuk kebutuhan satu fitur.** Bungkus atau buat
    varian baru lewat `cva`.
11. **TypeScript strict**: tanpa `any`, tanpa `@ts-ignore`. Gunakan `import type` untuk tipe.
12. **Teks UI berbahasa Indonesia.** Nama variabel, fungsi, file dalam bahasa Inggris.

## Penamaan

- File & folder: `kebab-case` (`product-card.tsx`, `use-product-list-params.ts`).
- Komponen: `PascalCase`, named export (bukan default), kecuali file khusus Next.js
  (`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`).
- Hook: `useXxx`. Hook query: `useProducts`, mutation: `useCreateProduct`.
- Fungsi API: kata kerja + resource (`getProducts`, `createProduct`, `updateProduct`).
- File API: satu operasi per file (`get-products.ts`, `create-product.ts`).
- Test: berdampingan dengan file yang dites, akhiran `.test.ts(x)`.

## Alur kerja umum

- **Fitur baru** → ikuti `docs/adding-a-feature.md` (contoh lengkap: `src/features/products`).
- **Halaman baru** → buat `src/app/<route>/page.tsx`, render container dari fitur.
- **Komponen shadcn baru** → `pnpm dlx shadcn@latest add <nama>` (config di `components.json`).
- **Env variable baru** → tambahkan ke `src/config/env.ts` (schema + `runtimeEnv`) dan `.env.example`.
- **Sambungkan ke backend asli** → set `NEXT_PUBLIC_API_URL`, hapus `src/mocks/` dan
  `src/app/api/products/`.

## Definition of done

Sebelum menyatakan tugas selesai:

1. `pnpm check` lolos (lint + typecheck + test).
2. Logika baru punya unit test (minimal schema dan komponen dumb yang punya percabangan).
3. Tidak ada `console.log`, kode mati, atau TODO tanpa konteks.
4. Jika menambah pola atau aturan baru, perbarui `AGENTS.md` / `docs/`.

## Catatan versi (hindari pola lama)

- **Next.js 16**, `cacheComponents` aktif. Data dinamis di Server Component perlu dibungkus
  `<Suspense>`. Tipe `PageProps`/`LayoutProps` di-generate oleh `next typegen`.
- **React 19**: `ref` adalah props biasa — jangan pakai `forwardRef`.
- **Tailwind v4**: konfigurasi lewat CSS (`@theme` di `globals.css`), tidak ada `tailwind.config.js`.
- **Zod v4**: pesan error lewat `{ error: '...' }`; gunakan `z.flattenError(err)` bukan `err.flatten()`.
- **TanStack Query v5**: `isPending` (bukan `isLoading`) untuk mutation; `placeholderData: keepPreviousData`.

## Dokumentasi lanjutan

- `docs/architecture.md` — lapisan, alur data, server vs client, keputusan state.
- `docs/conventions.md` — gaya kode, form, error handling, testing, commit.
- `docs/adding-a-feature.md` — langkah demi langkah membuat fitur baru.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

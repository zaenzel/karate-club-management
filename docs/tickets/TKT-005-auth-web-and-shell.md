# TKT-005: Login dan kerangka dashboard (web)

| Field           | Nilai                              |
| --------------- | ---------------------------------- |
| Area            | web                                |
| Prioritas       | P0                                 |
| Ukuran          | M                                  |
| Status          | Done                               |
| Bergantung pada | TKT-004                            |
| Membuka         | TKT-007, TKT-014, TKT-017, TKT-022 |
| Asumsi terkait  | -                                  |

## Konteks

`apps/web` masih memakai mock API bawaan template (`src/app/api/products`) dan belum punya login.
Api asli ada di port 4000 dengan cookie httpOnly (TKT-004). Supaya cookie dan request berada di
origin yang sama tanpa CORS, web meneruskan `/api/*` ke api lewat **rewrites Next.js**. Rewrites
berjalan setelah route di filesystem, jadi mock `src/app/api/products` tetap jalan sampai dihapus di
TKT-023.

## Tujuan

Admin bisa login di `/login`, semua halaman dashboard hanya bisa dibuka saat login, ada navigasi
utama, dan logout. Request web ke api asli berjalan lewat `/api`.

## Scope

### Termasuk

- Rewrites `/api/:path*` ke api (env server `API_PROXY_TARGET`, default `http://localhost:4000`).
- Fitur `features/auth`: login form, hook `useCurrentUser`, `useLogin`, `useLogout`.
- Halaman `/login` (di luar route group dashboard).
- Proteksi route dashboard + penanganan 401 global (kembali ke `/login`).
- Layout dashboard dengan navigasi menu fase 1 dan tombol logout.

### Tidak termasuk

- Halaman domain (cabang, member, dst).
- Menghapus contoh `products` (TKT-023).
- Lupa password atau ganti password.

## Bacaan wajib

- `apps/web/AGENTS.md`, `apps/web/docs/architecture.md`, `apps/web/docs/conventions.md`,
  `apps/web/docs/adding-a-feature.md`, contoh `src/features/products`.
- `src/lib/api-client.ts` (tempat interceptor 401), `src/config/env.ts`, `src/config/site.ts`,
  `src/app/(dashboard)/layout.tsx`, `next.config.ts`.
- Dokumentasi Next.js 16 untuk `rewrites` dan file proxy/middleware (di Next.js 16 namanya
  `proxy.ts`; cek dokumentasi versi yang terpasang sebelum menulis).

## Langkah-langkah

1. **Env.** Tambah `API_PROXY_TARGET` (server, `z.url()`, default `http://localhost:4000`) di
   `src/config/env.ts` (schema + `runtimeEnv`) dan di `.env.example` (root dan `apps/web` jika
   ada). Biarkan `NEXT_PUBLIC_API_URL` default `/api`.
2. **Rewrites.** Di `next.config.ts`, tambah `rewrites()` yang meneruskan `/api/:path*` ke
   `${API_PROXY_TARGET}/api/:path*`. Jangan merusak konfigurasi yang sudah ada. Verifikasi:
   `GET http://localhost:3000/api/health` mengembalikan respons dari api.
3. **Fitur `src/features/auth/`** (ikuti struktur products):
   - `types/auth.ts` (`CurrentUser`),
   - `api/query-keys.ts`, `api/login.ts` (`login` + `useLogin`), `api/logout.ts`,
     `api/get-current-user.ts` (`getCurrentUser` + `useCurrentUser`),
   - `schemas/login-schema.ts` (email valid, password wajib; pesan Indonesia) + test,
   - `components/login-form.tsx` (dumb, terima `onSubmit`, `isSubmitting`, `submitError`) + test,
   - `components/login-form-container.tsx` (sukses: invalidate `me`, redirect ke `/` atau ke
     parameter `next` jika ada dan diawali `/`),
   - `components/logout-button-container.tsx`,
   - `index.ts` sebagai public API.
4. **Halaman** `src/app/login/page.tsx`: tipis, judul "Masuk", render `LoginFormContainer`.
5. **Proteksi route.** Buat `proxy.ts` (atau nama yang benar di Next.js 16) yang mengarahkan
   request halaman tanpa cookie sesi ke `/login?next=<path>`. Kecualikan `/login`, `/api`,
   aset statis, dan route publik download (`/download`, dibuat di TKT-022). Nama cookie dibaca dari
   env yang sama dengan api (`AUTH_COOKIE_NAME`, tambahkan ke env web). Cek di proxy hanya
   keberadaan cookie; validitasnya dicek api.
6. **401 global.** Di interceptor respons `src/lib/api-client.ts`, jika status 401 dan berjalan di
   browser dan bukan di halaman `/login`, arahkan ke `/login`. Jangan import fitur dari `lib`.
7. **Navigasi.** Perbarui `siteConfig.nav`: Beranda, Cabang (`/branches`), Member (`/members`),
   Ujian (`/exams`), Sertifikat (`/certificates`), Template Sertifikat (`/certificate-templates`).
   Biarkan menu Produk sampai TKT-023. Halaman yang belum dibuat boleh 404 sementara.
8. **Header.** Tampilkan nama admin (dari `useCurrentUser`) dan tombol logout di layout dashboard.
   Komponen layout di `components/layout` harus tetap dumb; render container auth dari halaman
   atau layout `(dashboard)`.
9. **Test.** Schema login, `LoginForm` (validasi tampil, tombol disabled saat submit, pesan error
   server tampil dengan `role="alert"`). Tambah E2E sederhana jika api bisa dijalankan saat E2E;
   jika tidak, catat sebagai bagian TKT-023.

## Jangan lakukan

- Jangan menyimpan token atau data user di `localStorage`/Zustand persist.
- Jangan memanggil `axios`/`api` di luar `features/*/api`.
- Jangan menaruh logika di `page.tsx`.
- Jangan menghapus mock products di tiket ini.
- Jangan memakai `fetch` manual di komponen.

## Best practice

- Validasi parameter `next` hanya path internal (diawali `/`, bukan `//`) untuk mencegah open
  redirect.
- Label input terhubung `htmlFor`, error dengan `aria-invalid`.
- Teks UI: "Masuk", "Email", "Kata sandi", "Keluar".

## Kriteria selesai

- [x] Membuka `/` tanpa login diarahkan ke `/login?next=/`.
- [x] Login benar masuk ke dashboard dan nama admin tampil; login salah menampilkan pesan dari api.
- [x] Logout menghapus sesi dan kembali ke `/login`.
- [x] `http://localhost:3000/api/health` dilayani api asli; `/api/products` (mock) masih jalan.
- [x] Test schema dan form lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm dev:api   # terminal 1
pnpm dev:web   # terminal 2, lalu uji manual alur di atas
pnpm --filter @karate/web check
pnpm check && pnpm format:check
```

## Catatan

- Saat pilot di VPS, reverse proxy juga meneruskan `/api` ke api sehingga pola ini tetap sama.

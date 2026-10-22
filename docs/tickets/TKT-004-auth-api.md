# TKT-004: Auth Super Admin (api)

| Field           | Nilai                     |
| --------------- | ------------------------- |
| Area            | api                       |
| Prioritas       | P0                        |
| Ukuran          | M                         |
| Status          | Review                    |
| Bergantung pada | TKT-003                   |
| Membuka         | TKT-005, TKT-006, TKT-011 |
| Asumsi terkait  | -                         |

## Konteks

Fase 1 hanya punya satu aktor yang login: **Super Admin** (`User.role = SUPERADMIN`). Keputusan di
`docs/architecture.md`: JWT di **httpOnly cookie**, password di-hash **argon2**. Semua endpoint
admin harus terproteksi; hanya health, login, dan download publik yang terbuka.

Web akan memanggil api lewat proxy Next.js di origin yang sama (`/api/*`, lihat TKT-005), jadi
cookie cukup `SameSite=Lax` tanpa konfigurasi CORS credentials.

## Tujuan

Super Admin bisa login, mengecek sesi, dan logout. Semua endpoint baru otomatis terproteksi kecuali
ditandai publik.

## Scope

### Termasuk

- Endpoint: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Guard global JWT + decorator `@Public()` untuk pengecualian.
- Decorator `@CurrentUser()`.
- Rate limit login per IP.
- Skrip pembuatan Super Admin pertama dari env.

### Tidak termasuk

- Role lain, registrasi, lupa password, ganti password lewat UI, refresh token, 2FA.
- Halaman login web (TKT-005).

## Bacaan wajib

- `docs/architecture.md` bagian Auth, model `User` di `schema.prisma`, hasil TKT-003
  (`apps/api/README.md`).

## Langkah-langkah

1. Tambah dependency di `apps/api`: `@nestjs/jwt`, `argon2`, `cookie-parser` (+ tipenya),
   `@nestjs/throttler`. Cek kompatibilitas dengan NestJS 12 sebelum memasang.
2. **Env baru** (tambahkan ke `.env.example` root dengan komentar, dan ke schema `loadEnv()`):
   - `JWT_SECRET` (minimal 32 karakter; di `.env.example` isi nilai dev yang jelas palsu),
   - `JWT_EXPIRES_IN` (default `8h`),
   - `AUTH_COOKIE_NAME` (default `karate_session`),
   - `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NAME` (hanya dipakai skrip seed admin,
     boleh opsional di `loadEnv()`).
     Perbarui `env.spec.ts`.
3. `main.ts`: pasang `cookie-parser`. Set `app.set('trust proxy', 1)` hanya bila env menyatakan di
   belakang proxy (boleh ditunda; catat di README api).
4. Modul `src/auth/`: `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`,
   `jwt-auth.guard.ts`, `public.decorator.ts`, `current-user.decorator.ts`, `dto/login.dto.ts`.
5. **Login**: body `{ email, password }` (Zod: email valid, password tidak kosong). Cari user aktif
   by email (case-insensitive: simpan dan cari dalam huruf kecil), verifikasi argon2. Gagal karena
   apa pun (email tidak ada, password salah, user nonaktif) membalas **401 dengan pesan yang sama**:
   `Email atau password salah`. Sukses: set cookie `httpOnly`, `sameSite: 'lax'`,
   `secure: NODE_ENV === 'production'`, `path: '/'`, `maxAge` sama dengan masa berlaku JWT; balas
   `{ id, name, email, role }`. Payload JWT minimal: `sub` (user id) dan `role`.
6. **Me**: kembalikan user dari token. Cek ulang ke database bahwa user masih ada dan aktif; jika
   tidak, 401.
7. **Logout**: hapus cookie, balas 204. Boleh dipanggil tanpa sesi valid.
8. **Guard global**: daftarkan `JwtAuthGuard` sebagai `APP_GUARD`. Baca token dari cookie (bukan
   header Authorization). Endpoint dengan `@Public()` dilewati. Tandai `HealthController` dan
   `login`/`logout` sebagai publik.
9. **Rate limit**: `ThrottlerModule` dengan batas login, misalnya 5 percobaan per menit per IP,
   hanya di endpoint login (jangan global, supaya TKT-021 bisa mengatur batasnya sendiri).
10. **Seed Super Admin**: skrip idempotent (misal `pnpm --filter @karate/api seed:admin` atau
    di `packages/db/prisma/seed.ts`; pilih satu dan dokumentasikan). Hash dengan argon2. Jika email
    sudah ada, jangan menimpa password kecuali diberi flag eksplisit. Tambahkan perintahnya di
    `AGENTS.md` bagian Perintah.
11. **Audit**: catat login sukses (`action: 'auth.login'`) lewat `AuditService`.
12. **Test**: service (login sukses, email tidak ada, password salah, user nonaktif; semuanya
    pesan sama), guard (tanpa cookie 401, token rusak 401, `@Public()` lolos), dan controller
    (cookie di-set dengan atribut yang benar, logout menghapus cookie).
13. Tulis bagian Auth di `apps/api/README.md`: cara menandai endpoint publik dan cara mengambil
    user saat ini.

## Jangan lakukan

- Jangan menyimpan token di body respons atau menyarankan `localStorage` di web.
- Jangan membedakan pesan "email tidak terdaftar" dan "password salah".
- Jangan menulis password atau hash ke log atau audit.
- Jangan memakai bcrypt atau hash buatan sendiri; pakai argon2.
- Jangan membuat role atau tabel baru.
- Jangan commit nilai `JWT_SECRET` atau password asli.

## Best practice

- Bandingkan password hanya lewat `argon2.verify`.
- Jalankan verifikasi argon2 terhadap hash palsu ketika email tidak ditemukan, supaya waktu respons
  tidak membocorkan email mana yang terdaftar.
- Konfigurasi cookie di satu fungsi helper agar login dan logout memakai atribut yang sama.

## Kriteria selesai

- [x] Endpoint baru tanpa `@Public()` otomatis membalas 401 tanpa cookie.
- [x] Login benar mengeset cookie httpOnly; `GET /api/auth/me` mengembalikan user.
- [x] Login salah membalas 401 dengan pesan yang sama di semua kasus; percobaan ke-6 dalam semenit
      membalas 429.
- [x] Skrip seed admin idempotent dan terdokumentasi.
- [x] Env baru ada di `.env.example` dan divalidasi `loadEnv()`.
- [x] `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm --filter @karate/api check
# manual, saat pnpm dev:api berjalan:
curl -i -c /tmp/c.txt -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"<password dev>"}' http://localhost:4000/api/auth/login
curl -i -b /tmp/c.txt http://localhost:4000/api/auth/me
curl -i -X POST -b /tmp/c.txt http://localhost:4000/api/auth/logout
pnpm check && pnpm format:check
```

## Catatan

- Akun lain (admin cabang, coach, dll) ditunda ke fase berikutnya; jangan disiapkan sekarang.

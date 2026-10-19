---
name: new-feature
description: Scaffold a new feature module in apps/web/src/features following this repo's feature-based architecture (types, query keys, API hooks, dumb + container components, index.ts, page). Use when the user asks to add a new feature, domain, module, or CRUD page.
---

# New feature

Ikuti `apps/web/docs/adding-a-feature.md` dan tiru pola `apps/web/src/features/products`. Langkah:

1. **Pahami domain.** Tanya nama fitur (kebab-case, jamak: `orders`), field utama, dan operasi
   yang dibutuhkan (list, detail, create, update, delete) bila belum jelas.
2. **Baca referensi** sebelum menulis: `apps/web/src/features/products/index.ts`,
   `api/get-products.ts`, `api/create-product.ts`, `components/product-list-container.tsx`.
3. **Buat file sesuai urutan**: `types/` → `api/query-keys.ts` → `api/<operasi>.ts` (satu file per
   operasi) → `schemas/` (jika ada form) → komponen dumb → `*-container.tsx` → `index.ts`.
4. **Halaman** di `apps/web/src/app/(dashboard)/<fitur>/page.tsx`, import hanya dari `@/features/<fitur>`.
   Tambahkan ke `nav` di `apps/web/src/config/site.ts` bila user ingin muncul di menu.
5. **Test**: schema dan komponen dumb yang punya percabangan, berdampingan dengan file-nya.
6. **Verifikasi**: jalankan `pnpm --filter @karate/web check`. Perbaiki semua error sebelum melapor selesai.

Jangan:

- import `axios`/`@/lib/api-client` di luar `api/`
- import fitur lain dari dalam fitur
- menaruh logika di `page.tsx`
- membuat mock API baru kecuali user memintanya (backend asli diakses lewat `NEXT_PUBLIC_API_URL`)

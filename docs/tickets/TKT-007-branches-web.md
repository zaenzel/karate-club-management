# TKT-007: Fitur cabang (web)

| Field           | Nilai            |
| --------------- | ---------------- |
| Area            | web              |
| Prioritas       | P0               |
| Ukuran          | M                |
| Status          | Done             |
| Bergantung pada | TKT-005, TKT-006 |
| Membuka         | TKT-009          |
| Asumsi terkait  | -                |

## Konteks

Fitur domain pertama di web yang memakai api asli. Polanya akan ditiru fitur member dan ujian, jadi
ikuti contoh `src/features/products` dengan disiplin.

## Tujuan

Admin bisa melihat daftar cabang (cari + pagination), menambah, mengubah, dan menghapus cabang.

## Scope

### Termasuk

- Fitur `src/features/branches`.
- Halaman `/branches`, `/branches/new`, `/branches/[id]/edit` di route group `(dashboard)`.
- Konfirmasi sebelum hapus, pesan error dari api tampil.

### Tidak termasuk

- Memilih kepala cabang (dropdown coach). Field ini ditambahkan di TKT-009 setelah member ada,
  atau tampilkan read-only bila sudah terisi.
- Halaman detail cabang terpisah (cukup list + edit).

## Bacaan wajib

- `apps/web/AGENTS.md`, `apps/web/docs/adding-a-feature.md`, `apps/web/docs/conventions.md`.
- `src/features/products` seluruhnya, terutama `product-list-container.tsx`, `product-form.tsx`,
  `create-product.ts`, `use-product-list-params.ts`.
- Kontrak api di TKT-006.
- Untuk Claude Code: skill `new-feature`.

## Langkah-langkah

1. `types/branch.ts`: `Branch`, `BranchListParams` (`page`, `q`). Bentuk sama dengan respons api.
2. `api/query-keys.ts` lalu satu file per operasi: `get-branches.ts`, `get-branch.ts`,
   `create-branch.ts`, `update-branch.ts`, `delete-branch.ts`. Mutation meng-invalidate
   `branchKeys.lists()` dan detail terkait.
3. `schemas/branch-schema.ts`: aturan sama dengan api (kode 2-20 karakter huruf/angka/`-`, nama dan
   kota wajib, telepon opsional). Pesan Indonesia. Test schema.
4. `hooks/use-branch-list-params.ts`: simpan `page` dan `q` di URL search params (tiru
   `use-product-list-params.ts`). Pencarian memakai debounce dari `src/hooks`.
5. Komponen dumb: `branch-table.tsx` (kolom Kode, Nama, Kota, Telepon, Aksi; urutan render
   loading, error, kosong, data), `branch-form.tsx` (dipakai create dan edit). Test untuk
   keduanya (render data, state kosong, validasi form).
6. Container: `branch-list-container.tsx`, `create-branch-container.tsx`,
   `edit-branch-container.tsx`. Hapus memakai dialog konfirmasi "Hapus cabang X?"; pesan 409 dari
   api ("Cabang masih dipakai...") ditampilkan.
7. `index.ts`: export container, hook, tipe yang dipakai halaman.
8. Halaman tipis di `src/app/(dashboard)/branches/...` dengan `PageHeader` dan metadata judul
   ("Cabang", "Tambah cabang", "Ubah cabang").
9. Pastikan menu "Cabang" di navigasi mengarah ke `/branches`.
10. Jika butuh komponen UI baru (dialog, table, select), tambahkan lewat
    `pnpm dlx shadcn@latest add <nama>` ke `src/components/ui`; jangan menulis library UI lain.

## Jangan lakukan

- Jangan import dari `@/features/products` atau fitur lain.
- Jangan memakai `useEffect` + `fetch` untuk data.
- Jangan mengubah komponen `components/ui` yang sudah ada untuk kebutuhan fitur ini.
- Jangan membuat mock API baru.
- Jangan menulis warna hex di komponen.

## Best practice

- Satu schema Zod untuk form; tipe form dari `z.infer`.
- Setelah create/update sukses, arahkan kembali ke `/branches`.
- Tombol submit disabled saat `isPending`.

## Kriteria selesai

- [x] Daftar cabang dengan pencarian dan pagination berjalan; state tercermin di URL.
- [x] Tambah, ubah, hapus berjalan dan daftar ter-update tanpa reload manual.
- [x] Error api (kode duplikat, cabang dipakai) tampil jelas.
- [x] Test schema dan komponen dumb lolos; `pnpm check` dan `pnpm format:check` lolos.

## Cara verifikasi

```bash
pnpm dev:api & pnpm dev:web
pnpm --filter @karate/web check
pnpm check && pnpm format:check
```

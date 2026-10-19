# Arsitektur

## Prinsip

1. **Feature-based.** Kode dikelompokkan per domain bisnis (`features/products`), bukan per jenis
   file. Satu fitur bisa dibaca, diubah, atau dihapus tanpa menyisir seluruh repo.
2. **Arah dependensi satu arah.** Lapisan atas boleh memakai lapisan bawah, tidak sebaliknya.
3. **Satu pintu untuk HTTP.** Semua request lewat `features/*/api` → `lib/api-client`.
4. **Pisahkan data server dan state UI.** Data server di TanStack Query, state UI di Zustand/URL.

## Lapisan & arah import

```
            app/  (routing)
              │
              ▼
        features/<fitur>   ──X──  features/<fitur-lain>
              │
              ▼
 components/ · hooks/ · lib/ · providers/ · config/ · types/   (shared)
```

| Dari \ Ke               | `app` | `features/x` (index) | `features/x/*` (internal) | shared | `api-client`/`axios`  |
| ----------------------- | :---: | :------------------: | :-----------------------: | :----: | :-------------------: |
| `app/`                  |   ✓   |          ✓           |             ✗             |   ✓    |           ✗           |
| `features/x/` (non-api) |   ✗   |       ✗ (lain)       | ✓ relatif (fitur sendiri) |   ✓    |           ✗           |
| `features/x/api/`       |   ✗   |       ✗ (lain)       | ✓ relatif (fitur sendiri) |   ✓    |           ✓           |
| shared                  |   ✗   |          ✗           |             ✗             |   ✓    | hanya `api-client.ts` |

Aturan bertanda ✗ dijaga oleh `no-restricted-imports` di `eslint.config.mjs`.

## Alur data (client)

```
ProductListContainer          (smart, 'use client')
  ├─ useProductFilterStore    → state UI (search, category)
  ├─ useProductListParams     → ubah state jadi parameter API (+ debounce)
  └─ useProducts(params)      → TanStack Query: cache, loading, error, refetch
        └─ getProducts()      → fungsi fetch murni
              └─ api.get()    → axios instance: baseURL, token, normalisasi error → ApiError
  ▼
ProductFilters / ProductList / ProductCard   (dumb, props in → UI out)
```

Mutation mengikuti pola yang sama: `CreateProductContainer` → `useCreateProduct` →
`createProduct()` → `api.post()`, lalu `invalidateQueries(productKeys.lists())`.

## Smart vs dumb

| Jenis                 | Boleh                                        | Tidak boleh                   | Penamaan           |
| --------------------- | -------------------------------------------- | ----------------------------- | ------------------ |
| Smart (container)     | Memanggil hook query/mutation, store, router | Banyak markup/styling         | `*-container.tsx`  |
| Dumb (presentational) | Props, state UI lokal (`useState`, RHF)      | Hook data, store, API, router | `product-card.tsx` |

Tidak semua komponen perlu dipecah. Pecah jika komponen membesar, perlu dites tanpa mock, atau
ingin dipakai ulang dengan sumber data lain. `components/ui` dan `components/common` **selalu** dumb.

## Server Component vs Client Component

- Default: **Server Component**. Tambahkan `'use client'` hanya jika butuh hook, event handler, atau
  browser API.
- Server Component boleh `await getProducts()` langsung (fungsi dari layer API, bukan `fetch`
  mentah). Karena `cacheComponents` aktif, bungkus bagian yang mengambil data dinamis dengan
  `<Suspense fallback={...}>`.
- Untuk data yang dipakai bersama oleh server dan client (prefetch + hydrate), gunakan
  `getQueryClient()` + `HydrationBoundary` dari TanStack Query.
- Saat memanggil API dari server, `NEXT_PUBLIC_API_URL` harus URL absolut (bukan `/api`).

## Memilih tempat state

| Jenis state                                     | Tempat                                    |
| ----------------------------------------------- | ----------------------------------------- |
| Data dari backend                               | TanStack Query                            |
| Filter/pagination yang perlu dibagikan via link | URL search params                         |
| State UI lintas komponen dalam satu fitur       | Zustand di `features/<fitur>/stores`      |
| State UI global (tema, sidebar terbuka)         | Zustand di `src/stores` (buat jika perlu) |
| State form                                      | React Hook Form                           |
| State lokal satu komponen                       | `useState`                                |

Jangan menyalin data server ke Zustand — itu membuat dua sumber kebenaran.

## Error handling

- `api-client` menormalisasi semua error menjadi `ApiError` (`message`, `status`, `details`).
- Query error ditampilkan oleh komponen dumb (`ErrorState`) lewat props dari container.
- Error 4xx tidak di-retry (lihat `lib/query-client.ts`).
- Error render yang tak tertangani ditangkap `app/error.tsx`.

## Mock API

`src/app/api/products/route.ts` + `src/mocks/products-db.ts` meniru backend agar contoh bisa
jalan tanpa server lain. Kontraknya (`Paginated<T>`, body error `{ message }`) sengaja dibuat mirip
backend REST umum. Saat backend asli siap: set `NEXT_PUBLIC_API_URL`, hapus kedua lokasi tersebut,
dan sesuaikan `types/api.ts` dengan kontrak backend.

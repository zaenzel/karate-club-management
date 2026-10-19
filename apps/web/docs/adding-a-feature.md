# Menambah fitur baru

Contoh: membuat fitur `orders`. Referensi lengkap: `src/features/products`.

## 1. Struktur folder

```
src/features/orders/
├── api/
│   ├── query-keys.ts
│   ├── get-orders.ts
│   └── create-order.ts
├── components/
│   ├── order-list.tsx            (dumb)
│   ├── order-list.test.tsx
│   └── order-list-container.tsx  (smart)
├── schemas/order-schema.ts       (jika ada form)
├── types/order.ts
└── index.ts
```

Buat folder `hooks/` dan `stores/` hanya jika dibutuhkan.

## 2. Tipe domain — `types/order.ts`

```ts
export const ORDER_STATUSES = ['pending', 'paid', 'shipped'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = { id: string; code: string; total: number; status: OrderStatus };
export type OrderListParams = { page?: number; status?: OrderStatus };
```

## 3. Query keys — `api/query-keys.ts`

```ts
import type { OrderListParams } from '../types/order';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};
```

## 4. Fungsi API + hook — `api/get-orders.ts`

```ts
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';

import type { Order, OrderListParams } from '../types/order';
import { orderKeys } from './query-keys';

export async function getOrders(params: OrderListParams = {}) {
  const { data } = await api.get<Paginated<Order>>('/orders', { params });
  return data;
}

export function useOrders(params: OrderListParams = {}) {
  return useQuery({ queryKey: orderKeys.list(params), queryFn: () => getOrders(params) });
}
```

Mutation: lihat `features/products/api/create-product.ts` (invalidate `orderKeys.lists()` di
`onSuccess`).

## 5. Komponen dumb → container

- `order-list.tsx`: terima `orders`, `isLoading`, `isError`, `onRetry` lewat props. Gunakan
  `ErrorState`, `EmptyState`, `Skeleton` dari shared.
- `order-list-container.tsx`: `'use client'`, panggil `useOrders`, oper hasil ke `OrderList`.

## 6. Public API — `index.ts`

Export hanya yang dibutuhkan dari luar: container, hook/fungsi API, schema, tipe.

```ts
export { getOrders, useOrders } from './api/get-orders';
export { orderKeys } from './api/query-keys';
export { OrderListContainer } from './components/order-list-container';
export type { Order, OrderStatus } from './types/order';
```

## 7. Halaman — `src/app/(dashboard)/orders/page.tsx`

```tsx
import { PageHeader } from '@/components/common/page-header';
import { OrderListContainer } from '@/features/orders';

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Pesanan" />
      <OrderListContainer />
    </div>
  );
}
```

Tambahkan link di `src/config/site.ts` (`nav`) jika perlu.

## 8. Test & verifikasi

- Test schema (jika ada) dan komponen dumb yang punya percabangan.
- `pnpm check` harus lolos.

## Checklist

- [ ] Tidak ada import `axios`/`api-client` di luar `api/`
- [ ] Halaman hanya import dari `@/features/orders`
- [ ] Query key dari `query-keys.ts`, mutation meng-invalidate
- [ ] Komponen dumb tidak memanggil hook data/store
- [ ] Teks UI Bahasa Indonesia, loading/error/empty state tertangani
- [ ] `pnpm check` lolos

## Menghapus contoh `products`

Jika tidak dibutuhkan di proyek baru:

```bash
rm -rf src/features/products src/mocks "src/app/(dashboard)/products" src/app/api/products e2e/products.spec.ts
```

Lalu hapus link "Produk" di `src/config/site.ts` dan tombol di `src/app/page.tsx`.
Simpan dulu sebagai referensi sampai fitur pertama proyek selesai dibuat.

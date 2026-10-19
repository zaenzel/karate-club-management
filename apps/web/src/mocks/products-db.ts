/**
 * MOCK DATA — hanya untuk contoh & development.
 * Hapus folder `src/mocks/` dan `src/app/api/products/` saat backend asli sudah tersedia,
 * lalu ganti NEXT_PUBLIC_API_URL di `.env`.
 */
import type { Product, ProductListParams } from '@/features/products';
import type { Paginated } from '@/types/api';

const seed: Product[] = [
  {
    id: 'p-001',
    name: 'Cairan Pembersih Lantai 1L',
    description: 'Wangi lavender, aman untuk keramik dan marmer.',
    price: 24500,
    stock: 42,
    category: 'cleaning',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'p-002',
    name: 'Deterjen Cair 800ml',
    description: 'Untuk mesin cuci bukaan depan maupun atas.',
    price: 32000,
    stock: 18,
    category: 'laundry',
    createdAt: '2026-09-02T08:00:00.000Z',
  },
  {
    id: 'p-003',
    name: 'Sabun Cuci Piring 750ml',
    description: 'Ekstrak jeruk nipis, ampuh mengangkat lemak.',
    price: 15500,
    stock: 0,
    category: 'kitchen',
    createdAt: '2026-09-03T08:00:00.000Z',
  },
  {
    id: 'p-004',
    name: 'Pewangi Pakaian 900ml',
    description: 'Wangi tahan hingga 7 hari.',
    price: 21000,
    stock: 55,
    category: 'laundry',
    createdAt: '2026-09-04T08:00:00.000Z',
  },
  {
    id: 'p-005',
    name: 'Pembersih Kaca Spray 500ml',
    description: 'Bebas noda dan garis.',
    price: 18000,
    stock: 30,
    category: 'cleaning',
    createdAt: '2026-09-05T08:00:00.000Z',
  },
];

// Disimpan di globalThis supaya data tidak hilang saat hot reload di dev.
const store = globalThis as unknown as { __productsDb?: Product[] };
store.__productsDb ??= [...seed];

export function listProducts({
  page = 1,
  pageSize = 12,
  search,
  category,
}: ProductListParams): Paginated<Product> {
  const q = search?.toLowerCase().trim();
  const filtered = store
    .__productsDb!.filter((p) => (category ? p.category === category : true))
    .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const start = (page - 1) * pageSize;
  return {
    data: filtered.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    },
  };
}

export function insertProduct(input: Omit<Product, 'id' | 'createdAt'>): Product {
  const product: Product = {
    ...input,
    id: `p-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
  store.__productsDb!.push(product);
  return product;
}

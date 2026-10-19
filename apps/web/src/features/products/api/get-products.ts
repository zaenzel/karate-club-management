import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';

import type { Product, ProductListParams } from '../types/product';
import { productKeys } from './query-keys';

/** Fungsi fetch murni: bisa dipanggil dari hook (client) atau `await` di Server Component. */
export async function getProducts(params: ProductListParams = {}): Promise<Paginated<Product>> {
  const { data } = await api.get<Paginated<Product>>('/products', { params });
  return data;
}

/** Hook untuk Client Component. Komponen cukup panggil ini, tanpa tahu URL atau axios. */
export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
  });
}

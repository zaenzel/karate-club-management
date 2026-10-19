import type { ProductListParams } from '../types/product';

/**
 * Query key factory. Semua key fitur ini dibuat dari sini supaya
 * invalidasi cache konsisten (mis. setelah create → invalidate `lists()`).
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

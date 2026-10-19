import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ProductFormValues } from '../schemas/product-schema';
import type { Product } from '../types/product';
import { productKeys } from './query-keys';

export async function createProduct(input: ProductFormValues): Promise<Product> {
  const { data } = await api.post<Product>('/products', input);
  return data;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Semua list produk jadi basi setelah ada data baru.
      return queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

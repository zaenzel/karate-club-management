import { useDebounce } from '@/hooks/use-debounce';

import { useProductFilterStore } from '../stores/product-filter-store';
import type { ProductListParams } from '../types/product';

/**
 * Hook khusus fitur: menerjemahkan state filter (store) menjadi parameter API.
 * Search di-debounce supaya tidak menembak API di setiap ketikan.
 */
export function useProductListParams(): ProductListParams {
  const search = useProductFilterStore((s) => s.search);
  const category = useProductFilterStore((s) => s.category);
  const debouncedSearch = useDebounce(search, 300);

  return {
    search: debouncedSearch || undefined,
    category,
  };
}

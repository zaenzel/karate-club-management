import { create } from 'zustand';

import type { ProductCategory } from '../types/product';

/**
 * State UI milik client (bukan data server — data server ada di TanStack Query).
 *
 * Catatan: kalau filter perlu bisa dibagikan lewat link atau bertahan saat refresh,
 * simpan di URL search params, bukan di store.
 */
type ProductFilterState = {
  search: string;
  category: ProductCategory | undefined;
  setSearch: (search: string) => void;
  setCategory: (category: ProductCategory | undefined) => void;
  reset: () => void;
};

const initialState = { search: '', category: undefined };

export const useProductFilterStore = create<ProductFilterState>()((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  reset: () => set(initialState),
}));

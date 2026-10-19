import { Input } from '@/components/ui/input';

import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABEL, type ProductCategory } from '../types/product';

type ProductFiltersProps = {
  search: string;
  category: ProductCategory | undefined;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: ProductCategory | undefined) => void;
};

/** DUMB: nilai dan handler datang dari luar. */
export function ProductFilters({
  search,
  category,
  onSearchChange,
  onCategoryChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="search"
        placeholder="Cari produk…"
        aria-label="Cari produk"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:max-w-xs"
      />
      <select
        aria-label="Filter kategori"
        value={category ?? ''}
        onChange={(e) =>
          onCategoryChange((e.target.value || undefined) as ProductCategory | undefined)
        }
        className="h-9 rounded-md border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <option value="">Semua kategori</option>
        {PRODUCT_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {PRODUCT_CATEGORY_LABEL[c]}
          </option>
        ))}
      </select>
    </div>
  );
}

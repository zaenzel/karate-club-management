'use client';

import { useProducts } from '../api/get-products';
import { useProductListParams } from '../hooks/use-product-list-params';
import { useProductFilterStore } from '../stores/product-filter-store';
import { ProductFilters } from './product-filters';
import { ProductList } from './product-list';

/**
 * SMART (container): mengambil state & data, lalu mengoper ke komponen dumb.
 * Tidak ada markup styling berarti di sini — hanya wiring.
 */
export function ProductListContainer() {
  const { search, category, setSearch, setCategory } = useProductFilterStore();
  const params = useProductListParams();
  const { data, isLoading, isError, error, refetch } = useProducts(params);

  return (
    <div className="flex flex-col gap-6">
      <ProductFilters
        search={search}
        category={category}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
      />
      <ProductList
        products={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => void refetch()}
      />
      {data ? (
        <p className="text-sm text-muted-foreground">Total {data.meta.total} produk</p>
      ) : null}
    </div>
  );
}

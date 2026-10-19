import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Skeleton } from '@/components/ui/skeleton';

import type { Product } from '../types/product';
import { ProductCard } from './product-card';

type ProductListProps = {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
};

/**
 * DUMB (presentational): props in → UI out.
 * Mudah dites dan bisa dipakai ulang dengan sumber data lain.
 */
export function ProductList({
  products,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState message={errorMessage} onRetry={onRetry} />;

  if (products.length === 0) {
    return (
      <EmptyState
        title="Belum ada produk"
        description="Coba ubah filter atau tambah produk baru."
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

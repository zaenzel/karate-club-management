import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/common/page-header';
import { buttonVariants } from '@/components/ui/button';
import { ProductListContainer } from '@/features/products';

export const metadata: Metadata = { title: 'Produk' };

/** Halaman tipis: hanya layout + memanggil container dari feature. */
export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Produk"
        description="Contoh fitur lengkap: query, filter, state, dan mutation."
        actions={
          <Link href="/products/new" className={buttonVariants()}>
            Tambah produk
          </Link>
        }
      />
      <ProductListContainer />
    </div>
  );
}

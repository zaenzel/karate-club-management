import type { Metadata } from 'next';

import { PageHeader } from '@/components/common/page-header';
import { CreateProductContainer } from '@/features/products';

export const metadata: Metadata = { title: 'Tambah produk' };

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tambah produk"
        description="Validasi memakai schema Zod yang sama dengan API."
      />
      <CreateProductContainer />
    </div>
  );
}

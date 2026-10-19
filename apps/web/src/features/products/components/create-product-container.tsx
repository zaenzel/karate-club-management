'use client';

import { useRouter } from 'next/navigation';

import { useCreateProduct } from '../api/create-product';
import { ProductForm } from './product-form';

/** SMART: menghubungkan form (dumb) dengan mutation dan navigasi. */
export function CreateProductContainer() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  return (
    <ProductForm
      submitLabel="Tambah produk"
      isSubmitting={createProduct.isPending}
      submitError={createProduct.error?.message}
      onSubmit={(values) =>
        createProduct.mutate(values, {
          onSuccess: () => router.push('/products'),
        })
      }
    />
  );
}

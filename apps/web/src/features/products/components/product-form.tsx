'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { productFormSchema, type ProductFormValues } from '../schemas/product-schema';
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABEL } from '../types/product';

type ProductFormProps = {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void;
  isSubmitting?: boolean;
  submitError?: string;
  submitLabel?: string;
};

/**
 * Form presentational: mengurus state form & validasi, tapi TIDAK tahu soal API.
 * Bisa dipakai untuk "create" maupun "edit" — cukup beda `onSubmit` dan `defaultValues`.
 */
export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  submitLabel = 'Simpan',
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: '', description: '', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-5" noValidate>
      <Field id="name" label="Nama produk" error={errors.name?.message}>
        <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
      </Field>

      <Field id="description" label="Deskripsi" error={errors.description?.message}>
        <Textarea
          id="description"
          aria-invalid={!!errors.description}
          {...register('description')}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="price" label="Harga (Rp)" error={errors.price?.message}>
          <Input
            id="price"
            type="number"
            inputMode="numeric"
            aria-invalid={!!errors.price}
            {...register('price', { valueAsNumber: true })}
          />
        </Field>
        <Field id="stock" label="Stok" error={errors.stock?.message}>
          <Input
            id="stock"
            type="number"
            inputMode="numeric"
            aria-invalid={!!errors.stock}
            {...register('stock', { valueAsNumber: true })}
          />
        </Field>
      </div>

      <Field id="category" label="Kategori" error={errors.category?.message}>
        <select
          id="category"
          aria-invalid={!!errors.category}
          defaultValue=""
          {...register('category')}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-invalid:border-destructive"
        >
          <option value="" disabled>
            Pilih kategori
          </option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {PRODUCT_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </Field>

      {submitError ? (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

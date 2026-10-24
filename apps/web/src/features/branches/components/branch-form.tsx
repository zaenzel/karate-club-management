'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { branchFormSchema, type BranchFormValues } from '../schemas/branch-schema';

type BranchFormProps = {
  defaultValues?: Partial<BranchFormValues>;
  onSubmit: (values: BranchFormValues) => void;
  isSubmitting?: boolean;
  submitError?: string;
  submitLabel?: string;
  isEdit?: boolean;
  coachOptions?: { id: string; name: string }[];
};

export function BranchForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  submitLabel,
  isEdit = false,
  coachOptions = [],
}: BranchFormProps) {
  const finalSubmitLabel = submitLabel ?? (isEdit ? 'Perbarui Cabang' : 'Simpan');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      code: '',
      name: '',
      city: '',
      address: '',
      phone: '',
      headCoachId: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="code" label="Kode Cabang" error={errors.code?.message}>
          <Input
            id="code"
            placeholder="Contoh: JKT-01"
            className="font-mono uppercase"
            aria-invalid={!!errors.code}
            {...register('code')}
          />
          <p className="text-xs text-muted-foreground">Huruf besar, angka, dan tanda hubung (-)</p>
        </Field>

        <Field id="city" label="Kota" error={errors.city?.message}>
          <Input
            id="city"
            placeholder="Contoh: Jakarta Pusat"
            aria-invalid={!!errors.city}
            {...register('city')}
          />
        </Field>
      </div>

      <Field id="name" label="Nama Cabang" error={errors.name?.message}>
        <Input
          id="name"
          placeholder="Contoh: Dojo Senayan"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
      </Field>

      <Field id="address" label="Alamat (opsional)" error={errors.address?.message}>
        <Textarea
          id="address"
          placeholder="Alamat lengkap tempat latihan..."
          aria-invalid={!!errors.address}
          {...register('address')}
        />
      </Field>

      <Field id="phone" label="Nomor Telepon (opsional)" error={errors.phone?.message}>
        <Input
          id="phone"
          type="tel"
          placeholder="Contoh: +62 812-3456-7890"
          aria-invalid={!!errors.phone}
          {...register('phone')}
        />
      </Field>

      <Field
        id="headCoachId"
        label="Kepala Cabang (Coach) (opsional)"
        error={errors.headCoachId?.message}
      >
        <select
          id="headCoachId"
          {...register('headCoachId')}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Belum ditentukan</option>
          {coachOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {submitError}
        </div>
      ) : null}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : finalSubmitLabel}
        </Button>
        <Link href="/branches" className={buttonVariants({ variant: 'outline' })}>
          Batal
        </Link>
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
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

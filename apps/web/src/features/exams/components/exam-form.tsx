'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { BranchOption } from '../api/get-branch-options';
import { examSchema, type ExamFormValues } from '../schemas/exam-schema';

export interface ExamFormProps {
  defaultValues?: Partial<ExamFormValues>;
  onSubmit: (values: ExamFormValues) => void;
  isSubmitting?: boolean;
  submitError?: string;
  submitLabel?: string;
  isEdit?: boolean;
  canChangeType?: boolean;
  branchOptions?: BranchOption[];
}

export function ExamForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  submitLabel,
  isEdit = false,
  canChangeType = true,
  branchOptions = [],
}: ExamFormProps) {
  const finalSubmitLabel = submitLabel ?? (isEdit ? 'Perbarui Ujian' : 'Simpan Ujian');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: '',
      type: 'KYU',
      date: new Date().toISOString().slice(0, 10),
      location: '',
      baseFee: 150000,
      branchId: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-5" noValidate>
      <Field id="name" label="Nama Ujian" error={errors.name?.message}>
        <Input
          id="name"
          placeholder="Contoh: Ujian Kenaikan Tingkat Kyu Semester Genap 2026"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="type" label="Jenis Ujian" error={errors.type?.message}>
          <select
            id="type"
            disabled={isEdit && !canChangeType}
            {...register('type')}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="KYU">Ujian kyu (Sabuk Putih s/d Cokelat)</option>
            <option value="DAN">Ujian dan (Sabuk Hitam)</option>
          </select>
          {isEdit && !canChangeType && (
            <p className="text-xs text-muted-foreground">
              Jenis ujian tidak dapat diubah karena sudah memiliki peserta atau bukan draf.
            </p>
          )}
        </Field>

        <Field id="date" label="Tanggal Pelaksanaan" error={errors.date?.message}>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register('date')} />
        </Field>
      </div>

      <Field id="location" label="Tempat / Lokasi" error={errors.location?.message}>
        <Input
          id="location"
          placeholder="Contoh: Dojo Pusat Karate, Gelora Bung Karno"
          aria-invalid={!!errors.location}
          {...register('location')}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="baseFee" label="Biaya Dasar Peserta (Rp)" error={errors.baseFee?.message}>
          <Input
            id="baseFee"
            type="number"
            min={0}
            step={1000}
            aria-invalid={!!errors.baseFee}
            {...register('baseFee', { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Biaya default yang dicatat saat peserta didaftarkan
          </p>
        </Field>

        <Field id="branchId" label="Cabang Penyelenggara" error={errors.branchId?.message}>
          <select
            id="branchId"
            {...register('branchId')}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Pengurus Pusat (Semua Cabang)</option>
            {branchOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </Field>
      </div>

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
        <Link
          href={isEdit && defaultValues?.name ? `/exams` : '/exams'}
          className={buttonVariants({ variant: 'outline' })}
        >
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

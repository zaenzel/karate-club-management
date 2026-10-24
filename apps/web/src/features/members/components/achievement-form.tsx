'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { achievementFormSchema, type AchievementFormValues } from '../schemas/achievement-schema';
import {
  ACHIEVEMENT_LEVEL_LABELS,
  type Achievement,
  type AchievementLevel,
} from '../types/achievement';

export type AchievementFormProps = {
  initialData?: Achievement | null;
  onSubmit: (values: AchievementFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string;
};

export function AchievementForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}: AchievementFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementFormSchema),
    defaultValues: {
      championship: initialData?.championship ?? '',
      level: (initialData?.level ?? 'OTHER') as AchievementLevel,
      category: initialData?.category ?? '',
      result: initialData?.result ?? '',
      date: initialData?.date ?? new Date().toISOString().slice(0, 10),
      location: initialData?.location ?? '',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4"
      noValidate
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          {isEdit ? 'Ubah Data Prestasi' : 'Tambah Prestasi Baru'}
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="championship" label="Nama Kejuaraan" error={errors.championship?.message}>
          <Input
            id="championship"
            placeholder="Contoh: Piala Menpora 2026"
            aria-invalid={!!errors.championship}
            {...register('championship')}
          />
        </Field>

        <Field id="level" label="Tingkat Kejuaraan" error={errors.level?.message}>
          <select
            id="level"
            {...register('level')}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={!!errors.level}
          >
            {(Object.keys(ACHIEVEMENT_LEVEL_LABELS) as AchievementLevel[]).map((lvl) => (
              <option key={lvl} value={lvl}>
                {ACHIEVEMENT_LEVEL_LABELS[lvl]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="result" label="Hasil / Juara" error={errors.result?.message}>
          <Input
            id="result"
            placeholder="Contoh: Juara 1 (Emas)"
            aria-invalid={!!errors.result}
            {...register('result')}
          />
        </Field>

        <Field id="category" label="Kategori / Kelas (opsional)" error={errors.category?.message}>
          <Input
            id="category"
            placeholder="Contoh: Kumite Perorangan -65kg"
            aria-invalid={!!errors.category}
            {...register('category')}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="date" label="Tanggal Pelaksanaan" error={errors.date?.message}>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register('date')} />
        </Field>

        <Field id="location" label="Lokasi / Tempat (opsional)" error={errors.location?.message}>
          <Input
            id="location"
            placeholder="Contoh: Jakarta Convention Center"
            aria-invalid={!!errors.location}
            {...register('location')}
          />
        </Field>
      </div>

      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive"
        >
          {submitError}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : isEdit ? 'Perbarui Prestasi' : 'Simpan Prestasi'}
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
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

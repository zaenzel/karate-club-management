'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  memberCreateSchema,
  memberUpdateSchema,
  type MemberCreateFormValues,
} from '../schemas/member-schema';
import type { Belt, BranchOption, MemberType } from '../types/member';

export type MemberFormProps = {
  defaultValues?: Partial<MemberCreateFormValues>;
  onSubmit: (values: MemberCreateFormValues) => void;
  isSubmitting?: boolean;
  submitError?: string;
  submitLabel?: string;
  isEdit?: boolean;
  branchOptions?: BranchOption[];
  belts?: Belt[];
};

export function MemberForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitError,
  submitLabel,
  isEdit = false,
  branchOptions = [],
  belts = [],
}: MemberFormProps) {
  const [showInitialGrade, setShowInitialGrade] = useState(defaultValues?.hasInitialGrade ?? false);

  const finalSubmitLabel = submitLabel ?? (isEdit ? 'Perbarui Member' : 'Simpan Member');

  const formSchema = isEdit ? memberUpdateSchema : memberCreateSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemberCreateFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: 'STUDENT' as MemberType,
      name: '',
      birthPlace: '',
      birthDate: '',
      address: '',
      phone: '',
      branchId: '',
      hasInitialGrade: false,
      initialBeltId: '',
      initialBeltOrder: 1,
      initialKyu: 10,
      initialDan: 1,
      ...defaultValues,
    },
  });

  const selectedBeltId = watch('initialBeltId');
  const selectedBelt = belts.find((b) => b.id === selectedBeltId);
  const isBlackBelt = selectedBelt?.order === 6;

  const toggleInitialGrade = () => {
    const nextVal = !showInitialGrade;
    setShowInitialGrade(nextVal);
    setValue('hasInitialGrade', nextVal, { shouldValidate: true });
    if (nextVal && !selectedBeltId && belts.length > 0 && belts[0]) {
      // Default ke sabuk urutan 1 bila belum ada yang dipilih
      const firstBelt = belts[0];
      setValue('initialBeltId', firstBelt.id);
      setValue('initialBeltOrder', firstBelt.order);
      setValue('initialKyu', 10);
    }
  };

  const handleBeltChange = (beltId: string) => {
    setValue('initialBeltId', beltId, { shouldValidate: true });
    const found = belts.find((b) => b.id === beltId);
    if (found) {
      setValue('initialBeltOrder', found.order, { shouldValidate: true });
      if (found.order === 6) {
        setValue('initialKyu', 0, { shouldValidate: true });
        setValue('initialDan', 1, { shouldValidate: true });
      } else {
        setValue('initialDan', undefined, { shouldValidate: true });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-5" noValidate>
      {/* Tipe & Nama */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="type" label="Tipe Member" error={errors.type?.message as string}>
          <select
            id="type"
            {...register('type')}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={!!errors.type}
          >
            <option value="STUDENT">Murid</option>
            <option value="COACH">Coach</option>
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field id="name" label="Nama Lengkap" error={errors.name?.message as string}>
            <Input
              id="name"
              placeholder="Contoh: Budi Santoso"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
          </Field>
        </div>
      </div>

      {/* Tempat & Tanggal Lahir */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="birthPlace" label="Tempat Lahir" error={errors.birthPlace?.message as string}>
          <Input
            id="birthPlace"
            placeholder="Contoh: Bandung"
            aria-invalid={!!errors.birthPlace}
            {...register('birthPlace')}
          />
        </Field>

        <Field id="birthDate" label="Tanggal Lahir" error={errors.birthDate?.message as string}>
          <Input
            id="birthDate"
            type="date"
            aria-invalid={!!errors.birthDate}
            {...register('birthDate')}
          />
        </Field>
      </div>

      {/* Cabang & Telepon */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="branchId" label="Cabang Asal" error={errors.branchId?.message as string}>
          <select
            id="branchId"
            {...register('branchId')}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={!!errors.branchId}
          >
            <option value="">Pilih Cabang</option>
            {branchOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </Field>

        <Field id="phone" label="Nomor Telepon (opsional)" error={errors.phone?.message as string}>
          <Input
            id="phone"
            type="tel"
            placeholder="Contoh: 0812-3456-7890"
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
        </Field>
      </div>

      {/* Alamat */}
      <Field id="address" label="Alamat Lengkap" error={errors.address?.message as string}>
        <Textarea
          id="address"
          placeholder="Alamat domisili anggota..."
          aria-invalid={!!errors.address}
          {...register('address')}
        />
      </Field>

      {/* Tingkatan Awal (HANYA UNTUK CREATE MEMBER) */}
      {!isEdit ? (
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 transition-all">
          <button
            type="button"
            onClick={toggleInitialGrade}
            className="flex w-full items-center justify-between rounded-lg text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div>
              <span className="text-sm font-semibold text-foreground">
                Tingkatan Awal (Member Lama)
              </span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {showInitialGrade
                  ? 'Isi tingkatan awal jika member sudah memiliki riwayat sabuk sebelumnya.'
                  : 'Kosongkan untuk member baru: otomatis sabuk putih, kyu 10.'}
              </p>
            </div>
            <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {showInitialGrade ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </span>
          </button>

          {showInitialGrade ? (
            <div className="mt-4 grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-3">
              {/* Sabuk */}
              <Field
                id="initialBeltId"
                label="Warna Sabuk"
                error={errors.initialBeltId?.message as string}
              >
                <select
                  id="initialBeltId"
                  value={selectedBeltId || ''}
                  onChange={(e) => handleBeltChange(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Pilih Sabuk</option>
                  {belts.map((b) => (
                    <option key={b.id} value={b.id}>
                      Sabuk {b.name}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Kyu */}
              <Field
                id="initialKyu"
                label="Tingkat Kyu"
                error={errors.initialKyu?.message as string}
              >
                <Input
                  id="initialKyu"
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  placeholder="Contoh: 10 atau 5.5"
                  disabled={isBlackBelt}
                  {...register('initialKyu', { valueAsNumber: true })}
                />
                <p className="text-[11px] text-muted-foreground">10 s/d 0, kelipatan 0.5</p>
              </Field>

              {/* Dan (hanya aktif untuk sabuk hitam) */}
              <Field
                id="initialDan"
                label="Tingkat Dan"
                error={errors.initialDan?.message as string}
              >
                <Input
                  id="initialDan"
                  type="number"
                  step="1"
                  min="1"
                  max="10"
                  placeholder="Contoh: 1"
                  disabled={!isBlackBelt}
                  {...register('initialDan', { valueAsNumber: true })}
                />
                <p className="text-[11px] text-muted-foreground">
                  {isBlackBelt ? 'Minimal Dan 1 untuk sabuk hitam' : 'Hanya untuk sabuk hitam'}
                </p>
              </Field>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Error Banner */}
      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {submitError}
        </div>
      ) : null}

      {/* Submit Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : finalSubmitLabel}
        </Button>
        <Link href="/members" className={buttonVariants({ variant: 'outline' })}>
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

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { useBranch } from '../api/get-branch';
import { useUpdateBranch } from '../api/update-branch';
import { BranchForm } from './branch-form';
import type { BranchFormValues } from '../schemas/branch-schema';

type EditBranchContainerProps = {
  id: string;
};

export function EditBranchContainer({ id }: EditBranchContainerProps) {
  const router = useRouter();
  const { data: branch, isLoading, isError, error, refetch } = useBranch(id);
  const updateMutation = useUpdateBranch();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleSubmit = async (values: BranchFormValues) => {
    setSubmitError(undefined);
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          code: values.code.trim().toUpperCase(),
          name: values.name.trim(),
          city: values.city.trim(),
          address: values.address?.trim() ? values.address.trim() : null,
          phone: values.phone?.trim() ? values.phone.trim() : null,
        },
      });
      router.push('/branches');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal memperbarui cabang. Silakan coba lagi.';
      setSubmitError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="max-w-xl space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    );
  }

  if (isError || !branch) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center"
      >
        <p className="text-sm font-medium text-destructive">
          {error?.message || 'Cabang tidak ditemukan'}
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <BranchForm
        defaultValues={{
          code: branch.code,
          name: branch.name,
          city: branch.city,
          address: branch.address ?? '',
          phone: branch.phone ?? '',
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitError={submitError}
        submitLabel="Perbarui Cabang"
        isEdit
      />
    </div>
  );
}

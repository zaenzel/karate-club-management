'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCoachOptions } from '../api/get-coach-options';
import { useCreateBranch } from '../api/create-branch';
import { BranchForm } from './branch-form';
import type { BranchFormValues } from '../schemas/branch-schema';

export function CreateBranchContainer() {
  const router = useRouter();
  const createMutation = useCreateBranch();
  const { data: coachOptions = [] } = useCoachOptions();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleSubmit = async (values: BranchFormValues) => {
    setSubmitError(undefined);
    try {
      await createMutation.mutateAsync({
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        city: values.city.trim(),
        address: values.address?.trim() ? values.address.trim() : null,
        phone: values.phone?.trim() ? values.phone.trim() : null,
        headCoachId: values.headCoachId?.trim() ? values.headCoachId.trim() : null,
      });
      router.push('/branches');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menambahkan cabang. Silakan coba lagi.';
      setSubmitError(message);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <BranchForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitError={submitError}
        submitLabel="Tambah Cabang"
        coachOptions={coachOptions}
      />
    </div>
  );
}

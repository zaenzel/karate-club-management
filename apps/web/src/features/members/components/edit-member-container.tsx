'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';

import { useBranchOptions } from '../api/get-branch-options';
import { useMember } from '../api/get-member';
import { useUpdateMember } from '../api/update-member';
import type { MemberCreateFormValues } from '../schemas/member-schema';
import { MemberForm } from './member-form';

export function EditMemberContainer({ id }: { id: string }) {
  const router = useRouter();
  const { data: member, isLoading, isError, error, refetch } = useMember(id);
  const updateMutation = useUpdateMember(id);
  const { data: branchOptions = [] } = useBranchOptions();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleSubmit = async (values: MemberCreateFormValues) => {
    try {
      setSubmitError(undefined);
      await updateMutation.mutateAsync({
        type: values.type,
        name: values.name,
        birthPlace: values.birthPlace,
        birthDate: values.birthDate,
        address: values.address,
        phone: values.phone || null,
        branchId: values.branchId,
      });
      router.push(`/members/${id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui data member';
      setSubmitError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <ErrorState message={error?.message || 'Data member tidak dapat dimuat.'} onRetry={refetch} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ubah Data: ${member.name}`}
        description={`Nomor Anggota: ${member.memberNumber} • Perubahan tingkatan sabuk hanya dilakukan lewat ujian.`}
      />

      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs md:p-8">
        <MemberForm
          isEdit={true}
          defaultValues={{
            type: member.type,
            name: member.name,
            birthPlace: member.birthPlace,
            birthDate: member.birthDate,
            address: member.address,
            phone: member.phone ?? '',
            branchId: member.branch.id,
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          submitError={submitError}
          branchOptions={branchOptions}
        />
      </div>
    </div>
  );
}

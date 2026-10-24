'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/common/page-header';

import { useBelts } from '../api/get-belts';
import { useBranchOptions } from '../api/get-branch-options';
import { useCreateMember, type CreateMemberPayload } from '../api/create-member';
import type { MemberCreateFormValues } from '../schemas/member-schema';
import { MemberForm } from './member-form';

export function CreateMemberContainer() {
  const router = useRouter();
  const createMutation = useCreateMember();
  const { data: branchOptions = [] } = useBranchOptions();
  const { data: belts = [] } = useBelts();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleSubmit = async (values: MemberCreateFormValues) => {
    try {
      setSubmitError(undefined);
      const payload: CreateMemberPayload = {
        type: values.type,
        name: values.name,
        birthPlace: values.birthPlace,
        birthDate: values.birthDate,
        address: values.address,
        phone: values.phone || null,
        branchId: values.branchId,
      };

      if (values.hasInitialGrade && values.initialBeltId && values.initialKyu !== undefined) {
        payload.initialGrade = {
          beltId: values.initialBeltId,
          kyu: values.initialKyu,
          dan: values.initialDan || null,
        };
      }

      const newMember = await createMutation.mutateAsync(payload);
      router.push(`/members/${newMember.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menambahkan member';
      setSubmitError(message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Member Baru"
        description="Daftarkan atlet atau pelatih karate ke cabang dojo pilihan Anda."
      />

      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs md:p-8">
        <MemberForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          submitError={submitError}
          branchOptions={branchOptions}
          belts={belts}
        />
      </div>
    </div>
  );
}

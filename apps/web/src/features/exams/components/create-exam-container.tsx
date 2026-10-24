'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/common/page-header';

import { useBranchOptions } from '../api/get-branch-options';
import { useCreateExam } from '../api/create-exam';
import type { ExamFormValues } from '../schemas/exam-schema';
import { ExamForm } from './exam-form';

export function CreateExamContainer() {
  const router = useRouter();
  const createMutation = useCreateExam();
  const { data: branchOptions = [] } = useBranchOptions();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: ExamFormValues) => {
    try {
      setSubmitError(null);
      const created = await createMutation.mutateAsync(values);
      router.push(`/exams/${created.id}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal membuat jadwal ujian');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Jadwal Ujian Baru"
        description="Daftarkan event ujian kenaikan sabuk baru (status awal akan otomatis Draf)."
      />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <ExamForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          submitError={submitError ?? undefined}
          branchOptions={branchOptions}
        />
      </div>
    </div>
  );
}

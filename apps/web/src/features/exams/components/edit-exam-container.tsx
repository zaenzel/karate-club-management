'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/common/page-header';

import { useBranchOptions } from '../api/get-branch-options';
import { useExam } from '../api/get-exam';
import { useUpdateExam } from '../api/update-exam';
import type { ExamFormValues } from '../schemas/exam-schema';
import { ExamForm } from './exam-form';

export interface EditExamContainerProps {
  examId: string;
}

export function EditExamContainer({ examId }: EditExamContainerProps) {
  const router = useRouter();
  const { data: exam, isLoading, isError, error } = useExam(examId);
  const { data: branchOptions = [] } = useBranchOptions();
  const updateMutation = useUpdateExam();
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ubah Data Ujian" description="Memuat informasi ujian..." />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ubah Data Ujian" description="Terjadi kesalahan" />
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive"
        >
          {error instanceof Error ? error.message : 'Ujian tidak ditemukan'}
        </div>
      </div>
    );
  }

  const canChangeType = exam.status === 'DRAFT' && exam.stats.participants === 0;

  const handleSubmit = async (values: ExamFormValues) => {
    try {
      setSubmitError(null);
      await updateMutation.mutateAsync({ id: examId, values });
      router.push(`/exams/${examId}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal memperbarui ujian');
    }
  };

  const defaultValues: Partial<ExamFormValues> = {
    name: exam.name,
    type: exam.type,
    date: exam.date,
    location: exam.location,
    baseFee: exam.baseFee,
    branchId: exam.branch?.id ?? '',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ubah: ${exam.name}`}
        description="Perbarui informasi tanggal, lokasi, biaya dasar, atau cabang penyelenggara ujian."
      />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <ExamForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          submitError={submitError ?? undefined}
          isEdit={true}
          canChangeType={canChangeType}
          branchOptions={branchOptions}
        />
      </div>
    </div>
  );
}

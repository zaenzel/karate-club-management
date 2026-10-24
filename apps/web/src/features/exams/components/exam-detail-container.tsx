'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { buttonVariants } from '@/components/ui/button';

import { useBranchOptions } from '../api/get-branch-options';
import { useDeleteExam } from '../api/delete-exam';
import { useExam } from '../api/get-exam';
import { useSetExaminers } from '../api/set-examiners';
import { useStartExam } from '../api/start-exam';
import type { ExaminersFormValues } from '../schemas/examiners-schema';
import { ExamSummary } from './exam-summary';
import { ExaminersEditor } from './examiners-editor';
import { ExamParticipantsContainer } from './exam-participants-container';

export interface ExamDetailContainerProps {
  examId: string;
}

export function ExamDetailContainer({ examId }: ExamDetailContainerProps) {
  const router = useRouter();
  const { data: exam, isLoading, isError, error } = useExam(examId);
  const { data: branchOptions = [] } = useBranchOptions();

  const startMutation = useStartExam();
  const deleteMutation = useDeleteExam();
  const setExaminersMutation = useSetExaminers();

  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="space-y-6">
        <Link href="/exams" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <ArrowLeft className="mr-2 size-4" />
          Kembali ke Daftar Ujian
        </Link>
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive"
        >
          {error instanceof Error ? error.message : 'Ujian tidak ditemukan'}
        </div>
      </div>
    );
  }

  const handleStartExam = async () => {
    const confirmed = confirm(
      'Mulai pelaksanaan ujian ini? Status akan berubah menjadi "Berlangsung" dan penilaian peserta dapat dilakukan.',
    );
    if (!confirmed) return;

    try {
      setActionError(null);
      await startMutation.mutateAsync(exam.id);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Gagal memulai ujian');
    }
  };

  const handleDeleteExam = async () => {
    const confirmed = confirm(
      `Hapus ujian "${exam.name}"? Seluruh data peserta dan penguji akan ikut terhapus.`,
    );
    if (!confirmed) return;

    try {
      setActionError(null);
      await deleteMutation.mutateAsync(exam.id);
      router.push('/exams');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Gagal menghapus ujian');
    }
  };

  const handleSaveExaminers = async (values: ExaminersFormValues) => {
    try {
      setActionError(null);
      await setExaminersMutation.mutateAsync({ id: exam.id, values });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan daftar penguji');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/exams" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <ArrowLeft className="mr-2 size-4" />
          Daftar Ujian
        </Link>
      </div>

      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle className="size-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Ringkasan Ujian */}
      <ExamSummary
        exam={exam}
        onStartExam={handleStartExam}
        onDeleteExam={handleDeleteExam}
        isStarting={startMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Dewan Penguji */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-1">
          <ExaminersEditor
            initialExaminers={exam.examiners}
            onSave={handleSaveExaminers}
            isSubmitting={setExaminersMutation.isPending}
            isReadOnly={exam.status === 'FINISHED'}
          />
        </div>

        {/* Kolom Kanan: Peserta Ujian */}
        <div className="lg:col-span-2">
          <ExamParticipantsContainer exam={exam} branchOptions={branchOptions} />
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { Button, buttonVariants } from '@/components/ui/button';

import { useBranchOptions } from '../api/get-branch-options';
import { useDeleteExam } from '../api/delete-exam';
import { useExams } from '../api/get-exams';
import { useExamListParams } from '../hooks/use-exam-list-params';
import type { Exam } from '../types/exam';
import { ExamFilters } from './exam-filters';
import { ExamTable } from './exam-table';

export function ExamListContainer() {
  const { params, search, setSearch, page, setPage, status, type, branchId, setFilter } =
    useExamListParams();

  const { data, isLoading, isError, error, refetch } = useExams(params);
  const { data: branchOptions = [] } = useBranchOptions();
  const deleteMutation = useDeleteExam();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (exam: Exam) => {
    const confirmed = confirm(
      `Hapus ujian "${exam.name}"? Seluruh data peserta dan penguji akan ikut terhapus.`,
    );
    if (!confirmed) return;

    try {
      setDeleteError(null);
      await deleteMutation.mutateAsync(exam.id);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus ujian');
    }
  };

  const exams = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ujian Kenaikan Sabuk"
        description="Jadwal event ujian kyu dan dan, pengelolaan penguji, serta evaluasi hasil kenaikan sabuk."
        actions={
          <Link href="/exams/new" className={buttonVariants({ size: 'sm' })}>
            <Plus className="size-4" />
            <span>Buat Jadwal Ujian</span>
          </Link>
        }
      />

      {deleteError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {deleteError}
        </div>
      ) : null}

      <ExamFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        type={type}
        branchId={branchId}
        onFilterChange={setFilter}
        branchOptions={branchOptions}
      />

      <ExamTable
        exams={exams}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        onDelete={handleDelete}
      />

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
          <span>
            Halaman {page} dari {totalPages} ({meta?.total ?? 0} total ujian)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
              <span>Sebelumnya</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <span>Berikutnya</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

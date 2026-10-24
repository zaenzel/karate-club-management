'use client';

import Link from 'next/link';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import {
  EXAM_STATUS_LABELS,
  EXAM_TYPE_LABELS,
  canDeleteExam,
  canEditExam,
  formatExamDate,
  type Exam,
} from '../types/exam';

export interface ExamTableProps {
  exams: Exam[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onDelete: (exam: Exam) => void;
}

export function ExamTable({
  exams,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  onDelete,
}: ExamTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center"
      >
        <p className="text-sm font-medium text-destructive">
          {errorMessage || 'Gagal memuat data ujian'}
        </p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : null}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">Tidak ada ujian yang ditemukan</p>
        <p className="text-xs text-muted-foreground">
          Coba ubah kata kunci pencarian atau buat jadwal ujian baru.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">
                Nama Ujian
              </th>
              <th scope="col" className="px-4 py-3">
                Jenis
              </th>
              <th scope="col" className="px-4 py-3">
                Tanggal
              </th>
              <th scope="col" className="px-4 py-3">
                Tempat
              </th>
              <th scope="col" className="px-4 py-3">
                Penyelenggara
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Peserta
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {exams.map((exam) => {
              const statusVariant =
                exam.status === 'FINISHED'
                  ? 'success'
                  : exam.status === 'ONGOING'
                    ? 'default'
                    : 'muted';

              return (
                <tr key={exam.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3.5 font-medium text-foreground">
                    <Link
                      href={`/exams/${exam.id}`}
                      className="hover:underline focus-visible:underline"
                    >
                      {exam.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-foreground">
                      {EXAM_TYPE_LABELS[exam.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                    {formatExamDate(exam.date)}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3.5 text-muted-foreground">
                    {exam.location}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {exam.branch?.name ?? 'Pengurus Pusat'}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Badge variant={statusVariant}>{EXAM_STATUS_LABELS[exam.status]}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-foreground">
                        {exam.stats.participants}
                      </span>
                      {exam.stats.participants > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          {exam.stats.passed} lulus · {exam.stats.failed} gagal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/exams/${exam.id}`}
                        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                        title="Lihat detail"
                        aria-label={`Lihat detail ${exam.name}`}
                      >
                        <Eye className="size-4" />
                      </Link>

                      {canEditExam(exam.status) && (
                        <Link
                          href={`/exams/${exam.id}/edit`}
                          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                          title="Ubah ujian"
                          aria-label={`Ubah ${exam.name}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      )}

                      {canDeleteExam(exam.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDelete(exam)}
                          title="Hapus ujian"
                          aria-label={`Hapus ${exam.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

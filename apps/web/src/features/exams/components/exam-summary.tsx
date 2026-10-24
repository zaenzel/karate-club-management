'use client';

import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Building2,
  Coins,
  Pencil,
  Play,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';

import {
  EXAM_STATUS_LABELS,
  EXAM_TYPE_LABELS,
  canDeleteExam,
  canEditExam,
  canStartExam,
  formatExamDate,
  formatRupiah,
  type Exam,
} from '../types/exam';

export interface ExamSummaryProps {
  exam: Exam;
  onStartExam: () => void;
  onDeleteExam: () => void;
  isStarting?: boolean;
  isDeleting?: boolean;
}

export function ExamSummary({
  exam,
  onStartExam,
  onDeleteExam,
  isStarting = false,
  isDeleting = false,
}: ExamSummaryProps) {
  const statusVariant =
    exam.status === 'FINISHED' ? 'success' : exam.status === 'ONGOING' ? 'default' : 'muted';

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-semibold">
              {EXAM_TYPE_LABELS[exam.type]}
            </Badge>
            <Badge variant={statusVariant}>{EXAM_STATUS_LABELS[exam.status]}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {exam.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              {formatExamDate(exam.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              {exam.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="size-4 text-primary" />
              {exam.branch?.name ?? 'Pengurus Pusat'}
            </span>
            <span className="flex items-center gap-1.5">
              <Coins className="size-4 text-primary" />
              Biaya dasar: {formatRupiah(exam.baseFee)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canStartExam(exam.status) && (
            <Button variant="default" onClick={onStartExam} disabled={isStarting} className="gap-2">
              <Play className="size-4 fill-current" />
              {isStarting ? 'Memulai Ujian…' : 'Mulai Ujian'}
            </Button>
          )}

          {canEditExam(exam.status) && (
            <Link
              href={`/exams/${exam.id}/edit`}
              className={buttonVariants({ variant: 'outline', size: 'default' })}
            >
              <Pencil className="mr-2 size-4" />
              Ubah Data
            </Link>
          )}

          {canDeleteExam(exam.status) && (
            <Button
              variant="outline"
              onClick={onDeleteExam}
              disabled={isDeleting}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Hapus
            </Button>
          )}
        </div>
      </div>

      {/* Grid statistik peserta */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Peserta</p>
            <p className="text-xl font-bold text-foreground">{exam.stats.participants}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Lulus</p>
            <p className="text-xl font-bold text-success">{exam.stats.passed}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
            <XCircle className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tidak Lulus</p>
            <p className="text-xl font-bold text-destructive">{exam.stats.failed}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <HelpCircle className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Belum Dinilai</p>
            <p className="text-xl font-bold text-foreground">{exam.stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Ringkasan Dewan Penguji */}
      {exam.examiners.length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Dewan Penguji
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            {exam.examiners.map((examiner) => (
              <span
                key={examiner.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs"
              >
                {examiner.isChief && <Award className="size-3.5 text-primary" />}
                {examiner.name}
                {examiner.isChief && (
                  <Badge variant="default" className="ml-1 px-1 py-0 text-[10px]">
                    Ketua
                  </Badge>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

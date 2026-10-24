'use client';

import { AlertTriangle, CheckCircle, Lock, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import type { ExamStats } from '../types/exam';

export interface FinishExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFinish: () => Promise<void>;
  stats: ExamStats;
}

export function FinishExamDialog({
  isOpen,
  onClose,
  onConfirmFinish,
  stats,
}: FinishExamDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasPending = stats.pending > 0;
  const hasParticipants = stats.participants > 0;
  const canFinish = !hasPending && hasParticipants;

  const handleFinish = async () => {
    if (!canFinish) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onConfirmFinish();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menutup ujian';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-md flex-col rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 text-foreground">
            <Lock className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Tutup & Kunci Ujian</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup dialog">
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            Anda akan menutup pelaksanaan event ujian ini. Silakan periksa kembali ringkasan
            peserta:
          </p>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/20 p-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">{stats.participants}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lulus</p>
              <p className="text-lg font-bold text-success">{stats.passed}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gagal</p>
              <p className="text-lg font-bold text-destructive">{stats.failed}</p>
            </div>
          </div>

          {hasPending ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300"
            >
              <AlertTriangle className="size-4.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold">Masih ada {stats.pending} peserta belum dinilai</p>
                <p className="mt-0.5">
                  Seluruh peserta wajib memiliki hasil (Lulus atau Tidak Lulus) sebelum ujian dapat
                  ditutup.
                </p>
              </div>
            </div>
          ) : !hasParticipants ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive"
            >
              Ujian harus memiliki minimal satu peserta untuk dapat ditutup.
            </div>
          ) : (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/10 p-3.5 text-xs text-primary"
            >
              <CheckCircle className="size-4.5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Semua peserta telah dinilai</p>
                <p className="mt-0.5">
                  Setelah ditutup, hasil ujian akan dikunci permanen dan riwayat tingkatan resmi
                  akan dicatat otomatis untuk seluruh peserta yang lulus.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="default" onClick={handleFinish} disabled={!canFinish || isSubmitting}>
              {isSubmitting ? 'Menutup Ujian…' : 'Konfirmasi Tutup Ujian'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

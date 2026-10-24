'use client';

import { Award, CheckCircle2, X, XCircle, AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ExamBeltBadge } from './exam-belt-badge';
import { previewGradeResult } from '../schemas/participant-result-schema';
import type { ExamType } from '../types/exam';
import type { ExamBeltInfo, ExamParticipant, ExamResult } from '../types/participant';
import { formatGrade } from './participant-table';

export interface ParticipantResultDialogProps {
  participant: ExamParticipant | null;
  examType: ExamType;
  belts: ExamBeltInfo[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: {
    result: ExamResult;
    kyuDecrease?: number;
    danIncrease?: number;
    toBeltId?: string;
  }) => Promise<void>;
}

export function ParticipantResultDialog({
  participant,
  examType,
  belts,
  isOpen,
  onClose,
  onSave,
}: ParticipantResultDialogProps) {
  const [result, setResult] = useState<ExamResult>(participant?.result ?? 'PASSED');
  const [kyuDecrease, setKyuDecrease] = useState<number>(participant?.kyuDecrease ?? 1);
  const [danIncrease, setDanIncrease] = useState<number>(participant?.danIncrease ?? 1);
  const [toBeltId, setToBeltId] = useState<string>(
    participant?.toBelt?.id ?? participant?.from.belt.id ?? '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedTargetBelt = useMemo(
    () => belts.find((b) => b.id === toBeltId) ?? participant?.from.belt ?? null,
    [belts, toBeltId, participant],
  );

  const preview = useMemo(() => {
    if (!participant) return null;
    return previewGradeResult({
      examType,
      fromBelt: participant.from.belt,
      fromKyu: participant.from.kyu,
      fromDan: participant.from.dan,
      result,
      kyuDecrease: examType === 'KYU' ? kyuDecrease : undefined,
      danIncrease: examType === 'DAN' ? danIncrease : undefined,
      targetBelt: selectedTargetBelt,
    });
  }, [participant, examType, result, kyuDecrease, danIncrease, selectedTargetBelt]);

  if (!isOpen || !participant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (result === 'PASSED' && preview?.error) {
      setErrorMessage(preview.error);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSave({
        result,
        kyuDecrease: examType === 'KYU' ? kyuDecrease : undefined,
        danIncrease: examType === 'DAN' ? danIncrease : undefined,
        toBeltId: examType === 'KYU' ? toBeltId : undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan hasil ujian';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Award className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Penilaian Hasil Ujian</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup dialog">
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6" noValidate>
          {/* Info Member & Tingkatan Awal */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3.5">
            <div>
              <p className="text-sm font-semibold text-foreground">{participant.member.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {participant.member.memberNumber} · {participant.member.branch.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExamBeltBadge
                order={participant.from.belt.order}
                name={participant.from.belt.name}
              />
              <span className="text-xs font-semibold text-foreground">
                {formatGrade(participant.from.kyu, participant.from.dan)}
              </span>
            </div>
          </div>

          {/* Pilihan Hasil (Lulus / Tidak Lulus) */}
          <div className="flex flex-col gap-1.5">
            <Label>Hasil Ujian</Label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 font-medium transition-colors ${
                  result === 'PASSED'
                    ? 'border-success/60 bg-success/10 text-success'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <input
                  type="radio"
                  name="examResult"
                  value="PASSED"
                  checked={result === 'PASSED'}
                  onChange={() => setResult('PASSED')}
                  className="sr-only"
                />
                <CheckCircle2 className="size-4" />
                <span>Lulus</span>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 font-medium transition-colors ${
                  result === 'FAILED'
                    ? 'border-destructive/60 bg-destructive/10 text-destructive'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <input
                  type="radio"
                  name="examResult"
                  value="FAILED"
                  checked={result === 'FAILED'}
                  onChange={() => setResult('FAILED')}
                  className="sr-only"
                />
                <XCircle className="size-4" />
                <span>Tidak Lulus</span>
              </label>
            </div>
          </div>

          {/* Jika Lulus di Ujian KYU */}
          {result === 'PASSED' && examType === 'KYU' && (
            <div className="space-y-4 rounded-xl border border-border bg-muted/10 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="kyuDecrease">Penurunan Kyu</Label>
                  <Input
                    id="kyuDecrease"
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={10}
                    value={kyuDecrease}
                    onChange={(e) => setKyuDecrease(Number(e.target.value))}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Default: 1 (boleh 0.5, 2, dll)
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="toBeltId">Warna Sabuk Baru</Label>
                  <select
                    id="toBeltId"
                    value={toBeltId}
                    onChange={(e) => setToBeltId(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {belts.map((belt) => {
                      const isDisabled = belt.order < participant.from.belt.order;
                      return (
                        <option key={belt.id} value={belt.id} disabled={isDisabled}>
                          {belt.name} {isDisabled ? '(tidak boleh turun)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[11px] text-muted-foreground">Dipilih manual oleh penguji</p>
                </div>
              </div>
            </div>
          )}

          {/* Jika Lulus di Ujian DAN */}
          {result === 'PASSED' && examType === 'DAN' && (
            <div className="space-y-4 rounded-xl border border-border bg-muted/10 p-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="danIncrease">Kenaikan Tingkatan Dan</Label>
                <Input
                  id="danIncrease"
                  type="number"
                  step={1}
                  min={1}
                  max={10}
                  value={danIncrease}
                  onChange={(e) => setDanIncrease(Number(e.target.value))}
                />
                <p className="text-[11px] text-muted-foreground">Default: 1 tingkat ke atas</p>
              </div>
            </div>
          )}

          {/* Live Preview Card */}
          {result === 'PASSED' && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase">
                    Pratinjau Tingkatan Baru
                  </p>
                  {preview?.error ? (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircle className="size-3.5" />
                      <span>{preview.error}</span>
                    </div>
                  ) : preview ? (
                    <div className="mt-1 flex items-center gap-2">
                      <ExamBeltBadge order={preview.belt.order} name={preview.belt.name} />
                      <span className="text-sm font-bold text-foreground">
                        {formatGrade(preview.kyu, preview.dan)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (result === 'PASSED' && !!preview?.error)}
            >
              {isSubmitting ? 'Menyimpan…' : 'Simpan Hasil'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { CheckCircle2, Coins, Edit3, Trash2, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { ExamBeltBadge } from './exam-belt-badge';
import { formatRupiah, type ExamStatus } from '../types/exam';
import {
  EXAM_RESULT_LABELS,
  PAYMENT_STATUS_LABELS,
  type ExamParticipant,
  type PaymentStatus,
} from '../types/participant';

export interface ParticipantTableProps {
  participants: ExamParticipant[];
  examStatus: ExamStatus;
  isLoading?: boolean;
  onEditResult: (participant: ExamParticipant) => void;
  onEditPayment: (participant: ExamParticipant) => void;
  onRemoveParticipant: (participant: ExamParticipant) => void;
}

export function formatGrade(kyu: number, dan: number | null): string {
  if (dan !== null && dan !== undefined && dan >= 1) {
    return `Dan ${dan}`;
  }
  const kyuFormatted = String(kyu).replace('.', ',');
  return `Kyu ${kyuFormatted}`;
}

export function ParticipantTable({
  participants,
  examStatus,
  isLoading = false,
  onEditResult,
  onEditPayment,
  onRemoveParticipant,
}: ParticipantTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">Belum ada peserta terdaftar</p>
        <p className="text-xs text-muted-foreground">
          Klik tombol &quot;Tambah Peserta&quot; untuk mendaftarkan member ke ujian ini.
        </p>
      </div>
    );
  }

  const isReadOnly = examStatus === 'FINISHED';
  const canSetResult = examStatus === 'ONGOING';

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">
                No. Anggota
              </th>
              <th scope="col" className="px-4 py-3">
                Nama Member
              </th>
              <th scope="col" className="px-4 py-3">
                Cabang
              </th>
              <th scope="col" className="px-4 py-3">
                Tingkatan Awal
              </th>
              <th scope="col" className="px-4 py-3">
                Biaya
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Status Bayar
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Hasil
              </th>
              <th scope="col" className="px-4 py-3">
                Tingkatan Hasil
              </th>
              {!isReadOnly && (
                <th scope="col" className="px-4 py-3 text-right">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {participants.map((p) => {
              const paymentVariant: Record<PaymentStatus, 'destructive' | 'success' | 'outline'> = {
                UNPAID: 'destructive',
                PAID: 'success',
                WAIVED: 'outline',
              };

              return (
                <tr key={p.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.member.memberNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.member.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.member.branch.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ExamBeltBadge order={p.from.belt.order} name={p.from.belt.name} />
                      <span className="text-xs text-muted-foreground">
                        {formatGrade(p.from.kyu, p.from.dan)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatRupiah(p.fee)}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <Badge variant={paymentVariant[p.paymentStatus]}>
                      {PAYMENT_STATUS_LABELS[p.paymentStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {p.result === 'PASSED' ? (
                      <span className="inline-flex items-center gap-1 font-medium text-success">
                        <CheckCircle2 className="size-4" />
                        {EXAM_RESULT_LABELS.PASSED}
                      </span>
                    ) : p.result === 'FAILED' ? (
                      <span className="inline-flex items-center gap-1 font-medium text-destructive">
                        <XCircle className="size-4" />
                        {EXAM_RESULT_LABELS.FAILED}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Belum dinilai</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.result === 'PASSED' && p.preview ? (
                      <div className="flex items-center gap-2">
                        <ExamBeltBadge order={p.preview.belt.order} name={p.preview.belt.name} />
                        <span className="text-xs font-semibold text-foreground">
                          {formatGrade(p.preview.kyu, p.preview.dan)}
                        </span>
                      </div>
                    ) : p.result === 'FAILED' ? (
                      <span className="text-xs text-muted-foreground">Tetap</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  {!isReadOnly && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {canSetResult && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditResult(p)}
                            title="Input / Ubah Hasil"
                            aria-label={`Input hasil ${p.member.name}`}
                          >
                            <Edit3 className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPayment(p)}
                          title="Ubah Pembayaran"
                          aria-label={`Ubah pembayaran ${p.member.name}`}
                        >
                          <Coins className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onRemoveParticipant(p)}
                          title="Keluarkan Peserta"
                          aria-label={`Keluarkan ${p.member.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

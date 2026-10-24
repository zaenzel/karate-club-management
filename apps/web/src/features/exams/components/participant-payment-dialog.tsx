'use client';

import { Coins, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  PAYMENT_STATUS_LABELS,
  type ExamParticipant,
  type PaymentStatus,
} from '../types/participant';

export interface ParticipantPaymentDialogProps {
  participant: ExamParticipant | null;
  defaultFee?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { fee?: number; paymentStatus?: PaymentStatus }) => Promise<void>;
}

export function ParticipantPaymentDialog({
  participant,
  defaultFee,
  isOpen,
  onClose,
  onSave,
}: ParticipantPaymentDialogProps) {
  const getInitialFee = () => {
    if (participant?.fee !== undefined && participant.fee !== null && participant.fee > 0) {
      return participant.fee;
    }
    return defaultFee ?? 0;
  };

  const [fee, setFee] = useState<number | string>(getInitialFee);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    participant?.paymentStatus ?? 'UNPAID',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !participant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const numericFee = fee === '' ? 0 : Number(fee);
      await onSave({
        fee: isNaN(numericFee) ? 0 : numericFee,
        paymentStatus,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status pembayaran';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-md flex-col rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Coins className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Pembayaran Peserta</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup dialog">
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6" noValidate>
          <div>
            <p className="text-sm font-semibold text-foreground">{participant.member.name}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {participant.member.memberNumber} · {participant.member.branch.name}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="participantFee">Biaya Ujian (Rp)</Label>
              {defaultFee !== undefined && Number(fee) !== defaultFee && (
                <button
                  type="button"
                  onClick={() => setFee(defaultFee)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Set ke biaya ujian (Rp {defaultFee.toLocaleString('id-ID')})
                </button>
              )}
            </div>
            <Input
              id="participantFee"
              type="number"
              min={0}
              step={1000}
              value={fee}
              onChange={(e) => setFee(e.target.value === '' ? '' : e.target.value)}
              placeholder={defaultFee !== undefined ? String(defaultFee) : '0'}
            />
            {defaultFee !== undefined && (
              <p className="text-[11px] text-muted-foreground">
                Biaya dasar event ujian: Rp {defaultFee.toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paymentStatus">Status Pembayaran</Label>
            <select
              id="paymentStatus"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((status) => (
                <option key={status} value={status}>
                  {PAYMENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan…' : 'Simpan Pembayaran'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

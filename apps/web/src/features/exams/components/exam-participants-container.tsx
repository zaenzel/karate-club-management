'use client';

import { Lock, Plus, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { useBelts } from '../api/get-belts';
import type { BranchOption } from '../api/get-branch-options';
import { useParticipants } from '../api/get-participants';
import { useAddParticipants } from '../api/add-participants';
import { useRemoveParticipant } from '../api/remove-participant';
import { useUpdateParticipantPayment } from '../api/update-participant-payment';
import { useUpdateParticipantResult } from '../api/update-participant-result';
import { useFinishExam } from '../api/finish-exam';
import type { Exam } from '../types/exam';
import {
  EXAM_RESULT_LABELS,
  PAYMENT_STATUS_LABELS,
  type ExamParticipant,
  type ExamResult,
  type PaymentStatus,
} from '../types/participant';
import { AddParticipantsDialog } from './add-participants-dialog';
import { FinishExamDialog } from './finish-exam-dialog';
import { ParticipantPaymentDialog } from './participant-payment-dialog';
import { ParticipantResultDialog } from './participant-result-dialog';
import { ParticipantTable } from './participant-table';

export interface ExamParticipantsContainerProps {
  exam: Exam;
  branchOptions: BranchOption[];
}

export function ExamParticipantsContainer({ exam, branchOptions }: ExamParticipantsContainerProps) {
  const [branchFilter, setBranchFilter] = useState('');
  const [resultFilter, setResultFilter] = useState<ExamResult | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | ''>('');

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [selectedForPayment, setSelectedForPayment] = useState<ExamParticipant | null>(null);
  const [selectedForResult, setSelectedForResult] = useState<ExamParticipant | null>(null);

  const { data: participants = [], isLoading } = useParticipants(exam.id, {
    branchId: branchFilter || undefined,
    result: resultFilter || undefined,
    paymentStatus: paymentFilter || undefined,
  });

  const { data: belts = [] } = useBelts();

  const addParticipantsMutation = useAddParticipants(exam.id);
  const removeParticipantMutation = useRemoveParticipant(exam.id);
  const updatePaymentMutation = useUpdateParticipantPayment(exam.id);
  const updateResultMutation = useUpdateParticipantResult(exam.id);
  const finishExamMutation = useFinishExam();

  const handleRemove = async (participant: ExamParticipant) => {
    if (confirm(`Yakin ingin mengeluarkan ${participant.member.name} dari ujian?`)) {
      await removeParticipantMutation.mutateAsync(participant.id);
    }
  };

  const handleSavePayment = async (values: { fee?: number; paymentStatus?: PaymentStatus }) => {
    if (!selectedForPayment) return;
    await updatePaymentMutation.mutateAsync({
      participantId: selectedForPayment.id,
      values,
    });
  };

  const handleSaveResult = async (values: {
    result: ExamResult;
    kyuDecrease?: number;
    danIncrease?: number;
    toBeltId?: string;
  }) => {
    if (!selectedForResult) return;
    await updateResultMutation.mutateAsync({
      participantId: selectedForResult.id,
      values,
    });
  };

  const handleConfirmFinish = async () => {
    await finishExamMutation.mutateAsync(exam.id);
  };

  const isReadOnly = exam.status === 'FINISHED';
  const canFinish = exam.status === 'ONGOING';

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-xs">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Users className="size-5 text-primary" />
            <span>Daftar Peserta Ujian</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Kelola pendaftaran anggota, rincian biaya, dan penilaian hasil ujian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isReadOnly && (
            <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-1.5">
              <Plus className="size-4" />
              <span>Tambah Peserta</span>
            </Button>
          )}

          {canFinish && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsFinishOpen(true)}
              className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Lock className="size-4" />
              <span>Tutup Ujian</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filter cabang peserta"
        >
          <option value="">Semua cabang</option>
          {branchOptions.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value as ExamResult)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filter hasil peserta"
        >
          <option value="">Semua hasil</option>
          {(Object.keys(EXAM_RESULT_LABELS) as ExamResult[]).map((r) => (
            <option key={r} value={r}>
              {EXAM_RESULT_LABELS[r]}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filter status bayar"
        >
          <option value="">Semua pembayaran</option>
          {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((p) => (
            <option key={p} value={p}>
              {PAYMENT_STATUS_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {/* Participants Table */}
      <ParticipantTable
        participants={participants}
        examStatus={exam.status}
        isLoading={isLoading}
        onEditPayment={(p) => setSelectedForPayment(p)}
        onEditResult={(p) => setSelectedForResult(p)}
        onRemoveParticipant={handleRemove}
      />

      {/* Dialogs */}
      <AddParticipantsDialog
        examId={exam.id}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={(memberIds) => addParticipantsMutation.mutateAsync(memberIds)}
        branchOptions={branchOptions}
      />

      <ParticipantPaymentDialog
        participant={selectedForPayment}
        isOpen={Boolean(selectedForPayment)}
        onClose={() => setSelectedForPayment(null)}
        onSave={handleSavePayment}
      />

      <ParticipantResultDialog
        participant={selectedForResult}
        examType={exam.type}
        belts={belts}
        isOpen={Boolean(selectedForResult)}
        onClose={() => setSelectedForResult(null)}
        onSave={handleSaveResult}
      />

      <FinishExamDialog
        isOpen={isFinishOpen}
        onClose={() => setIsFinishOpen(false)}
        onConfirmFinish={handleConfirmFinish}
        stats={exam.stats}
      />
    </div>
  );
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PaymentStatus } from '../types/participant';
import { examKeys } from './query-keys';

interface UpdatePaymentArgs {
  examId: string;
  participantId: string;
  values: {
    fee?: number;
    paymentStatus?: PaymentStatus;
  };
}

export async function updateParticipantPayment({
  examId,
  participantId,
  values,
}: UpdatePaymentArgs): Promise<void> {
  await api.patch(`/exams/${examId}/participants/${participantId}/payment`, values);
}

export function useUpdateParticipantPayment(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participantId,
      values,
    }: {
      participantId: string;
      values: { fee?: number; paymentStatus?: PaymentStatus };
    }) => updateParticipantPayment({ examId, participantId, values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(examId) });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ParticipantResultFormValues } from '../schemas/participant-result-schema';
import { examKeys } from './query-keys';

interface UpdateResultArgs {
  examId: string;
  participantId: string;
  values: ParticipantResultFormValues;
}

export async function updateParticipantResult({
  examId,
  participantId,
  values,
}: UpdateResultArgs): Promise<void> {
  const payload = {
    ...values,
    toBeltId: values.toBeltId && values.toBeltId.length > 0 ? values.toBeltId : undefined,
  };
  await api.patch(`/exams/${examId}/participants/${participantId}/result`, payload);
}

export function useUpdateParticipantResult(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participantId,
      values,
    }: {
      participantId: string;
      values: ParticipantResultFormValues;
    }) => updateParticipantResult({ examId, participantId, values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(examId) });
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
}

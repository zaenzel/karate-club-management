import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import { examKeys } from './query-keys';

interface RemoveParticipantArgs {
  examId: string;
  participantId: string;
}

export async function removeParticipant({
  examId,
  participantId,
}: RemoveParticipantArgs): Promise<void> {
  await api.delete(`/exams/${examId}/participants/${participantId}`);
}

export function useRemoveParticipant(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantId: string) => removeParticipant({ examId, participantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(examId) });
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
}

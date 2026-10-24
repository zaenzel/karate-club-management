import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AddParticipantsResult } from '../types/participant';
import { examKeys } from './query-keys';

interface AddParticipantsArgs {
  examId: string;
  memberIds: string[];
}

export async function addParticipants({
  examId,
  memberIds,
}: AddParticipantsArgs): Promise<AddParticipantsResult> {
  const { data } = await api.post<AddParticipantsResult>(`/exams/${examId}/participants`, {
    memberIds,
  });
  return data;
}

export function useAddParticipants(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberIds: string[]) => addParticipants({ examId, memberIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(examId) });
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
}

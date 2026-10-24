import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ExamParticipant, ParticipantListParams } from '../types/participant';
import { examKeys } from './query-keys';

export async function getParticipants(
  examId: string,
  params: ParticipantListParams = {},
): Promise<ExamParticipant[]> {
  const { data } = await api.get<ExamParticipant[]>(`/exams/${examId}/participants`, {
    params,
  });
  return data;
}

export function useParticipants(examId: string, params: ParticipantListParams = {}) {
  return useQuery({
    queryKey: examKeys.participants(examId, params),
    queryFn: () => getParticipants(examId, params),
    enabled: Boolean(examId),
    placeholderData: keepPreviousData,
  });
}

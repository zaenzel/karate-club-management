import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { GradeHistoryItem } from '../types/member';
import { memberKeys } from './query-keys';

export async function getMemberGradeHistory(id: string): Promise<GradeHistoryItem[]> {
  const { data } = await api.get<GradeHistoryItem[]>(`/members/${id}/grade-history`);
  return data;
}

export function useMemberGradeHistory(id: string) {
  return useQuery({
    queryKey: memberKeys.gradeHistory(id),
    queryFn: () => getMemberGradeHistory(id),
    enabled: !!id,
  });
}

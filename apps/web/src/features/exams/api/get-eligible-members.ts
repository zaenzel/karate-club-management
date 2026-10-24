import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { EligibleMember } from '../types/participant';
import { examKeys } from './query-keys';

interface EligibleMembersParams {
  q?: string;
  branchId?: string;
}

export async function getEligibleMembers(
  examId: string,
  params: EligibleMembersParams = {},
): Promise<EligibleMember[]> {
  const { data } = await api.get<EligibleMember[]>(`/exams/${examId}/eligible-members`, {
    params,
  });
  return data;
}

export function useEligibleMembers(examId: string, params: EligibleMembersParams = {}) {
  return useQuery({
    queryKey: examKeys.eligibleMembers(examId, params.q, params.branchId),
    queryFn: () => getEligibleMembers(examId, params),
    enabled: Boolean(examId),
  });
}

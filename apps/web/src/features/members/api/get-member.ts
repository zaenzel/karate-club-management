import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Member } from '../types/member';
import { memberKeys } from './query-keys';

export async function getMember(id: string): Promise<Member> {
  const { data } = await api.get<Member>(`/members/${id}`);
  return data;
}

export function useMember(id: string) {
  return useQuery({
    queryKey: memberKeys.detail(id),
    queryFn: () => getMember(id),
    enabled: !!id,
  });
}

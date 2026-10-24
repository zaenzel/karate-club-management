import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';

import type { Member, MemberListParams } from '../types/member';
import { memberKeys } from './query-keys';

export async function getMembers(params: MemberListParams = {}): Promise<Paginated<Member>> {
  const { data } = await api.get<Paginated<Member>>('/members', { params });
  return data;
}

export function useMembers(params: MemberListParams = {}) {
  return useQuery({
    queryKey: memberKeys.list(params),
    queryFn: () => getMembers(params),
    placeholderData: keepPreviousData,
  });
}

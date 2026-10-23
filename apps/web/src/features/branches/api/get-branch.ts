import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Branch } from '../types/branch';
import { branchKeys } from './query-keys';

export async function getBranch(id: string): Promise<Branch> {
  const { data } = await api.get<Branch>(`/branches/${id}`);
  return data;
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => getBranch(id),
    enabled: Boolean(id),
  });
}

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { BranchOption } from '../types/branch';
import { branchKeys } from './query-keys';

export async function getBranchOptions(): Promise<BranchOption[]> {
  const { data } = await api.get<BranchOption[]>('/branches/options');
  return data;
}

export function useBranchOptions() {
  return useQuery({
    queryKey: branchKeys.options(),
    queryFn: getBranchOptions,
  });
}

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';

import { examKeys } from './query-keys';

export interface BranchOption {
  id: string;
  name: string;
  code: string;
}

export async function getBranchOptions(): Promise<BranchOption[]> {
  const { data } = await api.get<Paginated<BranchOption>>('/branches', {
    params: { page: 1, pageSize: 100 },
  });
  return data.data;
}

export function useBranchOptions() {
  return useQuery({
    queryKey: examKeys.branchOptions(),
    queryFn: getBranchOptions,
    staleTime: 5 * 60 * 1000,
  });
}

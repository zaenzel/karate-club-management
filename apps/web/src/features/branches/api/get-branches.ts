import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';

import type { Branch, BranchListParams } from '../types/branch';
import { branchKeys } from './query-keys';

export async function getBranches(params: BranchListParams = {}): Promise<Paginated<Branch>> {
  const { data } = await api.get<Paginated<Branch>>('/branches', { params });
  return data;
}

export function useBranches(params: BranchListParams = {}) {
  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: () => getBranches(params),
    placeholderData: keepPreviousData,
  });
}

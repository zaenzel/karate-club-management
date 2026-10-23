import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Branch, CreateBranchPayload } from '../types/branch';
import { branchKeys } from './query-keys';

export async function createBranch(payload: CreateBranchPayload): Promise<Branch> {
  const { data } = await api.post<Branch>('/branches', payload);
  return data;
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: branchKeys.options() });
    },
  });
}

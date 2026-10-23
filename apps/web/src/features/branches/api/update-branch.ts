import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Branch, UpdateBranchPayload } from '../types/branch';
import { branchKeys } from './query-keys';

type UpdateBranchArgs = {
  id: string;
  data: UpdateBranchPayload;
};

export async function updateBranch({ id, data }: UpdateBranchArgs): Promise<Branch> {
  const response = await api.patch<Branch>(`/branches/${id}`, data);
  return response.data;
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBranch,
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: branchKeys.detail(updated.id) });
      void queryClient.invalidateQueries({ queryKey: branchKeys.options() });
    },
  });
}

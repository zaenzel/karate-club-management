import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import { branchKeys } from './query-keys';

export async function deleteBranch(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/branches/${id}`);
  return data;
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: branchKeys.options() });
    },
  });
}

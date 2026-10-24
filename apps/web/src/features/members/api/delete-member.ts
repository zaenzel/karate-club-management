import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import { memberKeys } from './query-keys';

export async function deleteMember(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/members/${id}`);
  return data;
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import { memberKeys } from './query-keys';

export async function deleteAchievement(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/achievements/${id}`);
  return data;
}

export function useDeleteAchievement(memberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.achievements(memberId) });
    },
  });
}

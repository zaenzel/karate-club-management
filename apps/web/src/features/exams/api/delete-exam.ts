import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import { examKeys } from './query-keys';

export async function deleteExam(id: string): Promise<void> {
  await api.delete(`/exams/${id}`);
}

export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExam,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.removeQueries({ queryKey: examKeys.detail(id) });
    },
  });
}

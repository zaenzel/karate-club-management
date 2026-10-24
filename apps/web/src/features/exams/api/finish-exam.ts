import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Exam } from '../types/exam';
import { examKeys } from './query-keys';

export async function finishExam(id: string): Promise<Exam> {
  const { data } = await api.post<Exam>(`/exams/${id}/finish`);
  return data;
}

export function useFinishExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finishExam,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.setQueryData(examKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: examKeys.participants(updated.id) });
    },
  });
}

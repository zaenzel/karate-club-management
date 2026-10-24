import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Exam } from '../types/exam';
import { examKeys } from './query-keys';

export async function startExam(id: string): Promise<Exam> {
  const { data } = await api.post<Exam>(`/exams/${id}/start`);
  return data;
}

export function useStartExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startExam,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.setQueryData(examKeys.detail(updated.id), updated);
    },
  });
}

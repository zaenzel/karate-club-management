import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ExamFormValues } from '../schemas/exam-schema';
import type { Exam } from '../types/exam';
import { examKeys } from './query-keys';

export async function createExam(values: ExamFormValues): Promise<Exam> {
  const payload = {
    ...values,
    branchId: values.branchId && values.branchId.length > 0 ? values.branchId : null,
  };
  const { data } = await api.post<Exam>('/exams', payload);
  return data;
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ExamFormValues } from '../schemas/exam-schema';
import type { Exam } from '../types/exam';
import { examKeys } from './query-keys';

interface UpdateExamArgs {
  id: string;
  values: Partial<ExamFormValues>;
}

export async function updateExam({ id, values }: UpdateExamArgs): Promise<Exam> {
  const payload = {
    ...values,
    branchId: values.branchId && values.branchId.length > 0 ? values.branchId : null,
  };
  const { data } = await api.patch<Exam>(`/exams/${id}`, payload);
  return data;
}

export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExam,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.setQueryData(examKeys.detail(updated.id), updated);
    },
  });
}

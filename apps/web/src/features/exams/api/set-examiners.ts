import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ExaminersFormValues } from '../schemas/examiners-schema';
import type { Exam } from '../types/exam';
import { examKeys } from './query-keys';

interface SetExaminersArgs {
  id: string;
  values: ExaminersFormValues;
}

export async function setExaminers({ id, values }: SetExaminersArgs): Promise<Exam> {
  const { data } = await api.put<Exam>(`/exams/${id}/examiners`, values);
  return data;
}

export function useSetExaminers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setExaminers,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.setQueryData(examKeys.detail(updated.id), updated);
    },
  });
}

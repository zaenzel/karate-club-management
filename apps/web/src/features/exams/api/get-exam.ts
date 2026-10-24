import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Exam } from '../types/exam';
import { examKeys } from './query-keys';

export async function getExam(id: string): Promise<Exam> {
  const { data } = await api.get<Exam>(`/exams/${id}`);
  return data;
}

export function useExam(id: string) {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => getExam(id),
    enabled: Boolean(id),
  });
}

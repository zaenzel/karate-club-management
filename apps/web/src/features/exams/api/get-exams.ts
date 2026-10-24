import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';

import type { Exam, ExamListParams } from '../types/exam';
import { examKeys } from './query-keys';

export async function getExams(params: ExamListParams = {}): Promise<Paginated<Exam>> {
  const { data } = await api.get<Paginated<Exam>>('/exams', { params });
  return data;
}

export function useExams(params: ExamListParams = {}) {
  return useQuery({
    queryKey: examKeys.list(params),
    queryFn: () => getExams(params),
    placeholderData: keepPreviousData,
  });
}

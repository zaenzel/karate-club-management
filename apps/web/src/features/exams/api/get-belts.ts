import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ExamBeltInfo } from '../types/participant';
import { examKeys } from './query-keys';

export async function getBelts(): Promise<ExamBeltInfo[]> {
  const { data } = await api.get<ExamBeltInfo[]>('/belts');
  return data;
}

export function useBelts() {
  return useQuery({
    queryKey: examKeys.belts(),
    queryFn: getBelts,
    staleTime: 60 * 60 * 1000,
  });
}

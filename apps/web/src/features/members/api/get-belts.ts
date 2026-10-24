import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Belt } from '../types/member';
import { memberKeys } from './query-keys';

export async function getBelts(): Promise<Belt[]> {
  const { data } = await api.get<Belt[]>('/belts');
  return data;
}

export function useBelts() {
  return useQuery({
    queryKey: memberKeys.belts(),
    queryFn: getBelts,
  });
}

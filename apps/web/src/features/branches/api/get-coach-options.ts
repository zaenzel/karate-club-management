import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';

import { branchKeys } from './query-keys';

export type CoachOption = {
  id: string;
  name: string;
};

export async function getCoachOptions(): Promise<CoachOption[]> {
  const { data } = await api.get<Paginated<{ id: string; name: string }>>('/members', {
    params: { type: 'COACH', pageSize: 100 },
  });
  return data.data.map((m) => ({ id: m.id, name: m.name }));
}

export function useCoachOptions() {
  return useQuery({
    queryKey: [...branchKeys.all, 'coaches'] as const,
    queryFn: getCoachOptions,
  });
}

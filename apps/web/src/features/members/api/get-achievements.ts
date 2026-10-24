import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Achievement } from '../types/achievement';
import { memberKeys } from './query-keys';

export async function getAchievements(memberId: string): Promise<Achievement[]> {
  const { data } = await api.get<Achievement[]>(`/members/${memberId}/achievements`);
  return data;
}

export function useAchievements(memberId: string) {
  return useQuery({
    queryKey: memberKeys.achievements(memberId),
    queryFn: () => getAchievements(memberId),
    enabled: !!memberId,
  });
}

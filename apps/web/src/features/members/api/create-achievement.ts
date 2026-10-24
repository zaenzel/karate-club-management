import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Achievement, AchievementLevel } from '../types/achievement';
import { memberKeys } from './query-keys';

export type CreateAchievementPayload = {
  championship: string;
  level: AchievementLevel;
  category?: string | null;
  result: string;
  date: string;
  location?: string | null;
};

export async function createAchievement(
  memberId: string,
  payload: CreateAchievementPayload,
): Promise<Achievement> {
  const { data } = await api.post<Achievement>(`/members/${memberId}/achievements`, payload);
  return data;
}

export function useCreateAchievement(memberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAchievementPayload) => createAchievement(memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.achievements(memberId) });
    },
  });
}

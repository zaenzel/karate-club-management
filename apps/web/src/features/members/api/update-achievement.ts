import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Achievement, AchievementLevel } from '../types/achievement';
import { memberKeys } from './query-keys';

export type UpdateAchievementPayload = {
  championship?: string;
  level?: AchievementLevel;
  category?: string | null;
  result?: string;
  date?: string;
  location?: string | null;
};

export async function updateAchievement(
  id: string,
  payload: UpdateAchievementPayload,
): Promise<Achievement> {
  const { data } = await api.patch<Achievement>(`/achievements/${id}`, payload);
  return data;
}

export function useUpdateAchievement(memberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAchievementPayload }) =>
      updateAchievement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.achievements(memberId) });
    },
  });
}

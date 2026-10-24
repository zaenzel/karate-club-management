import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Member } from '../types/member';
import { memberKeys } from './query-keys';

export type UpdateMemberPayload = {
  type?: 'COACH' | 'STUDENT';
  name?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  phone?: string | null;
  branchId?: string;
};

export async function updateMember(id: string, payload: UpdateMemberPayload): Promise<Member> {
  const { data } = await api.patch<Member>(`/members/${id}`, payload);
  return data;
}

export function useUpdateMember(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMemberPayload) => updateMember(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
      queryClient.setQueryData(memberKeys.detail(id), updated);
    },
  });
}

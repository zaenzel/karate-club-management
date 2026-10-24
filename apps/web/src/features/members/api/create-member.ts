import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Member } from '../types/member';
import { memberKeys } from './query-keys';

export type CreateMemberPayload = {
  type: 'COACH' | 'STUDENT';
  name: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  phone?: string | null;
  branchId: string;
  initialGrade?: {
    beltId: string;
    kyu: number;
    dan?: number | null;
  } | null;
};

export async function createMember(payload: CreateMemberPayload): Promise<Member> {
  const { data } = await api.post<Member>('/members', payload);
  return data;
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
      queryClient.setQueryData(memberKeys.detail(newMember.id), newMember);
    },
  });
}

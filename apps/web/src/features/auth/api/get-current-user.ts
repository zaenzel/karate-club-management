'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { CurrentUser } from '../types/auth';
import { authKeys } from './query-keys';

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>('/auth/me');
  return data;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

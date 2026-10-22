'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { LoginFormValues } from '../schemas/login-schema';
import type { CurrentUser } from '../types/auth';
import { authKeys } from './query-keys';

export async function login(input: LoginFormValues): Promise<CurrentUser> {
  const { data } = await api.post<CurrentUser>('/auth/login', input);
  return data;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

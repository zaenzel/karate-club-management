'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api-client';

import { authKeys } from './query-keys';

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.clear();
      router.push('/login');
      router.refresh();
    },
  });
}

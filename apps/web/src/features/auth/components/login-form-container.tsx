'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { useLogin } from '../api/login';
import { authKeys } from '../api/query-keys';
import type { LoginFormValues } from '../schemas/login-schema';
import { LoginForm } from './login-form';

export function LoginFormContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const loginMutation = useLogin();

  const handleSubmit = (values: LoginFormValues) => {
    setErrorMessage(undefined);
    loginMutation.mutate(values, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authKeys.me() });
        const nextParam = searchParams.get('next');
        const target =
          nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';
        router.push(target);
        router.refresh();
      },
      onError: (err: Error) => {
        setErrorMessage(err.message || 'Email atau password salah');
      },
    });
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isSubmitting={loginMutation.isPending}
      submitError={errorMessage}
    />
  );
}

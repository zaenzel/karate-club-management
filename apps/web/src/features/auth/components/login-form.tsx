'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { loginSchema, type LoginFormValues } from '../schemas/login-schema';

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void;
  isSubmitting?: boolean;
  submitError?: string;
};

export function LoginForm({ onSubmit, isSubmitting = false, submitError }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@karate.local"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email ? (
          <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Kata sandi</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {submitError ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="mt-1 w-full font-medium">
        {isSubmitting ? 'Memproses…' : 'Masuk'}
      </Button>
    </form>
  );
}

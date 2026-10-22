import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginFormContainer } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke dashboard sistem manajemen klub karate.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
          <CardDescription>
            Masukkan email dan kata sandi untuk mengakses akun Super Admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={<div className="text-center text-sm text-muted-foreground">Memuat…</div>}
          >
            <LoginFormContainer />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

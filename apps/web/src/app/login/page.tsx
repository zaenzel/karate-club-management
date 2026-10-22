import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { LoginFormContainer } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke dashboard sistem manajemen klub karate.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="group mb-3 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform hover:scale-105"
            aria-label={siteConfig.name}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M4 14l5-2" />
              <path d="M20 14l-5-2" />
              <path d="M9 16l-3 4" />
              <path d="M15 16l3 4" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{siteConfig.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground">Portal Manajemen Dojo & Klub Karate</p>
        </div>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-base font-semibold">Masuk ke Akun</CardTitle>
            <CardDescription className="text-xs">
              Gunakan kredensial Super Admin Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="py-8 text-center text-xs text-muted-foreground">Memuat form…</div>
              }
            >
              <LoginFormContainer />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Aplikasi Manajemen Karate &copy; 2026
        </p>
      </div>
    </div>
  );
}

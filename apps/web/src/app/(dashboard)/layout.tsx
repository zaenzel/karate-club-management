import type { ReactNode } from 'react';

import { AppHeader } from '@/components/layout/app-header';
import { siteConfig } from '@/config/site';
import { UserNavContainer } from '@/features/auth';

/**
 * Route group `(dashboard)`: tidak muncul di URL, berbagi layout dashboard.
 * Menampilkan header dengan navigasi dan status login user.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader userSlot={<UserNavContainer />} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-border/70 py-6 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <span>{siteConfig.name} &bull; Manajemen Dojo & Klub Karate</span>
          <span>Fase 1</span>
        </div>
      </footer>
    </div>
  );
}

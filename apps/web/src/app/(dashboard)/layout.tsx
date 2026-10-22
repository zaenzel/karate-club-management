import type { ReactNode } from 'react';

import { AppHeader } from '@/components/layout/app-header';
import { UserNavContainer } from '@/features/auth';

/**
 * Route group `(dashboard)`: tidak muncul di URL, berbagi layout dashboard.
 * Menampilkan header dengan navigasi dan status login user.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader userSlot={<UserNavContainer />} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

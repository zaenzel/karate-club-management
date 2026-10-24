import type { ReactNode } from 'react';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { UserNavContainer } from '@/features/auth';

/**
 * Route group `(dashboard)`: tidak muncul di URL, berbagi layout dashboard.
 * Menampilkan sidebar responsif (mobile-first drawer + desktop sidebar) dengan menu lengkap.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell userSlot={<UserNavContainer />}>{children}</DashboardShell>;
}

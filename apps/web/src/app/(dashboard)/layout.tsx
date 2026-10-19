import type { ReactNode } from 'react';

/**
 * Route group `(dashboard)`: tidak muncul di URL, hanya berbagi layout.
 * Tambahkan sidebar, auth guard, dll di sini.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl px-4 py-10">{children}</div>;
}

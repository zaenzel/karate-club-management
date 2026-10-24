'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

import { AppSidebar } from './app-sidebar';
import { DashboardHeader } from './dashboard-header';

export interface DashboardShellProps {
  children: ReactNode;
  userSlot?: ReactNode;
}

export function DashboardShell({ children, userSlot }: DashboardShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => setIsMobileOpen(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Lock body scroll and listen for Escape when mobile drawer is open
  useEffect(() => {
    if (!isMobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Mobile Backdrop Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden',
          isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Slide-Over Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi Mobile"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-full max-w-xs shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <AppSidebar
          userSlot={userSlot}
          onClose={() => setIsMobileOpen(false)}
          className="h-full shadow-xl"
        />
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:z-20 md:flex md:w-64 md:flex-col lg:w-72">
        <AppSidebar userSlot={userSlot} className="h-full shadow-2xs" />
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col md:pl-64 lg:pl-72">
        <DashboardHeader onOpenSidebar={() => setIsMobileOpen(true)} userSlot={userSlot} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        <footer className="border-t border-border/70 py-6 text-xs text-muted-foreground">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
            <span>{siteConfig.name} &bull; Manajemen Dojo & Klub Karate</span>
            <span>Fase 1</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

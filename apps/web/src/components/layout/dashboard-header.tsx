'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export interface DashboardHeaderProps {
  onOpenSidebar: () => void;
  userSlot?: ReactNode;
}

export function DashboardHeader({ onOpenSidebar, userSlot }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-md md:px-6">
      {/* Mobile: Hamburger Button & Brand */}
      <div className="flex items-center gap-3 md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          aria-label="Buka menu navigasi"
          className="size-9 rounded-xl border border-border/70 hover:bg-muted"
        >
          <Menu className="size-5" />
        </Button>

        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M4 14l5-2" />
              <path d="M20 14l-5-2" />
              <path d="M9 16l-3 4" />
              <path d="M15 16l3 4" />
            </svg>
          </span>
          <span className="max-w-[150px] truncate text-sm font-bold tracking-tight text-foreground sm:max-w-none">
            {siteConfig.name}
          </span>
        </Link>
      </div>

      {/* Desktop: Page context / brand badge */}
      <div className="hidden items-center gap-2 md:flex">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Panel Manajemen
        </span>
        <span className="text-muted-foreground/40">&bull;</span>
        <span className="text-xs font-medium text-foreground">Karate Club Management System</span>
      </div>

      {/* Right Slot: User info or actions */}
      {userSlot ? <div className="flex items-center gap-3">{userSlot}</div> : null}
    </header>
  );
}

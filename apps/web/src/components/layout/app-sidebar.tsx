'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

import { SidebarNav, type NavGroupConfig } from './sidebar-nav';

export interface AppSidebarProps {
  navGroups?: readonly NavGroupConfig[];
  userSlot?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function AppSidebar({ navGroups, userSlot, onClose, className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-border/80 bg-card text-card-foreground',
        className,
      )}
      aria-label="Sidebar Menu"
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-4">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg p-1 font-semibold text-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shadow-primary/25">
            {/* Minimalist martial arts belt knot / dojo crest icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M4 14l5-2" />
              <path d="M20 14l-5-2" />
              <path d="M9 16l-3 4" />
              <path d="M15 16l3 4" />
            </svg>
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight whitespace-nowrap text-foreground">
              {siteConfig.name}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Manajemen Dojo & Klub
            </span>
          </div>
        </Link>

        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground md:hidden"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-3">
        <SidebarNav groups={navGroups} onNavigate={onClose} />
      </div>

      {/* Sidebar Footer */}
      <div className="shrink-0 border-t border-border/70 p-3">
        {userSlot ? (
          <div className="mb-2 rounded-xl border border-border/50 bg-muted/40 p-2">{userSlot}</div>
        ) : null}
        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-muted-foreground">
          <span>Versi 1.0</span>
          <span>Fase 1</span>
        </div>
      </div>
    </aside>
  );
}

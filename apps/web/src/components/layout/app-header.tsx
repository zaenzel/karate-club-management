import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';

import { siteConfig } from '@/config/site';

import { HeaderNav } from './header-nav';

type AppHeaderProps = {
  userSlot?: ReactNode;
  navItems?: readonly { label: string; href: string }[];
};

export function AppHeader({ userSlot, navItems = siteConfig.nav }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              {/* Minimalist martial arts belt knot / dojo crest icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M4 14l5-2" />
                <path d="M20 14l-5-2" />
                <path d="M9 16l-3 4" />
                <path d="M15 16l3 4" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
              {siteConfig.name}
            </span>
          </Link>
          <Suspense fallback={<nav className="hidden h-8 items-center gap-1 md:flex" />}>
            <HeaderNav items={navItems} />
          </Suspense>
        </div>
        {userSlot ? <div className="flex items-center gap-3">{userSlot}</div> : null}
      </div>
    </header>
  );
}

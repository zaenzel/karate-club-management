import Link from 'next/link';
import type { ReactNode } from 'react';

import { siteConfig } from '@/config/site';

type AppHeaderProps = {
  userSlot?: ReactNode;
  navItems?: readonly { label: string; href: string }[];
};

export function AppHeader({ userSlot, navItems = siteConfig.nav }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold whitespace-nowrap">
            {siteConfig.name}
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {userSlot ? <div className="flex items-center gap-4">{userSlot}</div> : null}
      </div>
    </header>
  );
}

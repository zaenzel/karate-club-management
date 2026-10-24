'use client';

import { Suspense } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  Building2,
  CalendarCheck2,
  FileBadge2,
  LayoutDashboard,
  LayoutGrid,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface NavItemConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export interface NavGroupConfig {
  title?: string;
  items: readonly NavItemConfig[];
}

export const defaultNavGroups: readonly NavGroupConfig[] = [
  {
    title: 'Menu Utama',
    items: [
      {
        label: 'Beranda',
        href: '/',
        icon: LayoutDashboard,
      },
      {
        label: 'Cabang (Dojo)',
        href: '/branches',
        icon: Building2,
      },
      {
        label: 'Member & Pelatih',
        href: '/members',
        icon: Users,
      },
      {
        label: 'Ujian Kenaikan Sabuk',
        href: '/exams',
        icon: CalendarCheck2,
      },
      {
        label: 'Sertifikat',
        href: '/certificates',
        icon: Award,
      },
      {
        label: 'Template Sertifikat',
        href: '/certificate-templates',
        icon: FileBadge2,
      },
    ],
  },
  {
    title: 'Lainnya',
    items: [
      {
        label: 'Produk',
        href: '/products',
        icon: LayoutGrid,
        badge: 'Demo',
      },
    ],
  },
] as const;

export interface SidebarNavProps {
  groups?: readonly NavGroupConfig[];
  onNavigate?: () => void;
  className?: string;
}

function SidebarNavFallback({ groups = defaultNavGroups, onNavigate, className }: SidebarNavProps) {
  return (
    <nav className={cn('flex flex-col gap-6 px-3 py-2', className)} aria-label="Navigasi Utama">
      {groups.map((group, groupIdx) => (
        <div key={group.title ?? `group-${groupIdx}`} className="flex flex-col gap-1.5">
          {group.title ? (
            <span className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase select-none">
              {group.title}
            </span>
          ) : null}
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className="group flex min-h-[44px] items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-150 outline-none select-none hover:bg-muted/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <Badge
                      variant="muted"
                      className="ml-2 shrink-0 text-[10px] font-medium tracking-wide uppercase"
                    >
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarNavContent({ groups = defaultNavGroups, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col gap-6 px-3 py-2', className)} aria-label="Navigasi Utama">
      {groups.map((group, groupIdx) => (
        <div key={group.title ?? `group-${groupIdx}`} className="flex flex-col gap-1.5">
          {group.title ? (
            <span className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase select-none">
              {group.title}
            </span>
          ) : null}
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group flex min-h-[44px] items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-[0.99]',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary-foreground/15 text-primary-foreground'
                          : 'bg-muted/60 text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <Badge
                      variant={isActive ? 'secondary' : 'muted'}
                      className={cn(
                        'ml-2 shrink-0 text-[10px] font-medium tracking-wide uppercase',
                        isActive &&
                          'border-transparent bg-primary-foreground/20 text-primary-foreground',
                      )}
                    >
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function SidebarNav(props: SidebarNavProps) {
  return (
    <Suspense fallback={<SidebarNavFallback {...props} />}>
      <SidebarNavContent {...props} />
    </Suspense>
  );
}

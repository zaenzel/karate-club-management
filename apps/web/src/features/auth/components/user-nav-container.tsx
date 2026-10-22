'use client';

import { Badge } from '@/components/ui/badge';

import { useCurrentUser } from '../api/get-current-user';
import { LogoutButtonContainer } from './logout-button-container';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return (first + last).toUpperCase();
}

function formatRole(role: string): string {
  if (role === 'SUPER_ADMIN') return 'Super Admin';
  return role.toLowerCase().replace(/_/g, ' ');
}

export function UserNavContainer() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="size-7 animate-pulse rounded-full bg-muted" />
        <div className="hidden h-4 w-20 animate-pulse rounded bg-muted sm:block" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span
          className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shadow-2xs ring-1 ring-primary/25 select-none"
          title={user.email}
        >
          {getInitials(user.name)}
        </span>
        <div className="hidden flex-col leading-none sm:flex">
          <span className="max-w-[120px] truncate text-xs font-medium text-foreground">
            {user.name}
          </span>
        </div>
        <Badge variant="secondary" className="hidden text-[10px] font-medium sm:inline-flex">
          {formatRole(user.role)}
        </Badge>
      </div>
      <div className="h-4 w-px bg-border/80" />
      <LogoutButtonContainer />
    </div>
  );
}

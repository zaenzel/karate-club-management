'use client';

import { useCurrentUser } from '../api/get-current-user';
import { LogoutButtonContainer } from './logout-button-container';

export function UserNavContainer() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div className="h-8 w-24 animate-pulse rounded bg-muted" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-foreground">{user.name}</span>
      <LogoutButtonContainer />
    </div>
  );
}

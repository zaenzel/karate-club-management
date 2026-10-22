'use client';

import { Button } from '@/components/ui/button';

import { useLogout } from '../api/logout';

export function LogoutButtonContainer({ className }: { className?: string }) {
  const logoutMutation = useLogout();

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      disabled={logoutMutation.isPending}
      onClick={() => logoutMutation.mutate()}
    >
      {logoutMutation.isPending ? 'Keluar…' : 'Keluar'}
    </Button>
  );
}

'use client';

import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useLogout } from '../api/logout';

export function LogoutButtonContainer({ className }: { className?: string }) {
  const logoutMutation = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      disabled={logoutMutation.isPending}
      onClick={() => logoutMutation.mutate()}
      title="Keluar dari sistem"
    >
      <LogOut className="size-3.5" />
      <span>{logoutMutation.isPending ? 'Keluar…' : 'Keluar'}</span>
    </Button>
  );
}

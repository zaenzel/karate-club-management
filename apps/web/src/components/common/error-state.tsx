import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = 'Gagal memuat data.', onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/10 px-6 py-10 text-center"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
        <AlertCircle className="size-5" />
      </span>
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}

'use client';

import { ErrorState } from '@/components/common/error-state';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <ErrorState message={error.message || 'Terjadi kesalahan.'} onRetry={reset} />
    </div>
  );
}

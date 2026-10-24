import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { CreateMemberContainer } from '@/features/members';

export const metadata: Metadata = {
  title: 'Tambah Member',
  description: 'Daftarkan anggota atau pelatih baru ke klub karate.',
};

function CreateMemberFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="max-w-xl space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function NewMemberPage() {
  return (
    <Suspense fallback={<CreateMemberFallback />}>
      <CreateMemberContainer />
    </Suspense>
  );
}

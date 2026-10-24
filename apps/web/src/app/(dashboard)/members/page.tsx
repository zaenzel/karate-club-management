import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { MemberListContainer } from '@/features/members';

export const metadata: Metadata = {
  title: 'Member & Pelatih',
  description: 'Daftar atlet, pelatih karate, dan riwayat tingkatan sabuk dojo.',
};

function MemberListFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<MemberListFallback />}>
      <MemberListContainer />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { Suspense, use } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { MemberDetailContainer } from '@/features/members';

export const metadata: Metadata = {
  title: 'Detail Member',
  description: 'Informasi lengkap profil, riwayat tingkatan, dan prestasi atlet karate.',
};

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

function MemberDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <MemberDetailContainer id={id} />;
}

function MemberDetailFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

export default function MemberDetailPage({ params }: MemberDetailPageProps) {
  return (
    <Suspense fallback={<MemberDetailFallback />}>
      <MemberDetailContent params={params} />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { Suspense, use } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { EditMemberContainer } from '@/features/members';

export const metadata: Metadata = {
  title: 'Ubah Data Member',
  description: 'Perbarui data pribadi dan informasi cabang anggota klub karate.',
};

type EditMemberPageProps = {
  params: Promise<{ id: string }>;
};

function EditMemberContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditMemberContainer id={id} />;
}

function EditMemberFallback() {
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

export default function EditMemberPage({ params }: EditMemberPageProps) {
  return (
    <Suspense fallback={<EditMemberFallback />}>
      <EditMemberContent params={params} />
    </Suspense>
  );
}

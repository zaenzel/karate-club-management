import type { Metadata } from 'next';
import { Suspense, use } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { EditBranchContainer } from '@/features/branches';

export const metadata: Metadata = { title: 'Ubah Cabang' };

type EditBranchPageProps = {
  params: Promise<{ id: string }>;
};

function EditBranchContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditBranchContainer id={id} />;
}

function EditBranchFallback() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export default function EditBranchPage({ params }: EditBranchPageProps) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ubah Cabang"
        description="Perbarui informasi cabang, kontak, atau alamat."
      />
      <Suspense fallback={<EditBranchFallback />}>
        <EditBranchContent params={params} />
      </Suspense>
    </div>
  );
}

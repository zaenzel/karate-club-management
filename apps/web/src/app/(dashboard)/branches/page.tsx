import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BranchListContainer } from '@/features/branches';

export const metadata: Metadata = { title: 'Cabang' };

function BranchListFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-72 rounded-lg" />
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function BranchesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Cabang"
        description="Daftar cabang klub karate, alamat, kontak, dan jumlah anggota."
        actions={
          <Link href="/branches/new" className={buttonVariants()}>
            <Plus className="size-4" />
            <span>Tambah cabang</span>
          </Link>
        }
      />
      <Suspense fallback={<BranchListFallback />}>
        <BranchListContainer />
      </Suspense>
    </div>
  );
}

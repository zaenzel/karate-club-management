import type { Metadata } from 'next';
import { Suspense, use } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { EditExamContainer } from '@/features/exams';

export const metadata: Metadata = {
  title: 'Ubah Data Ujian',
  description: 'Perbarui data dan informasi jadwal event ujian kenaikan sabuk.',
};

interface EditExamPageProps {
  params: Promise<{ id: string }>;
}

function EditExamContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditExamContainer examId={id} />;
}

function EditExamFallback() {
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

export default function EditExamPage({ params }: EditExamPageProps) {
  return (
    <Suspense fallback={<EditExamFallback />}>
      <EditExamContent params={params} />
    </Suspense>
  );
}

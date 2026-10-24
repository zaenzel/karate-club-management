import type { Metadata } from 'next';
import { Suspense, use } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { ExamDetailContainer } from '@/features/exams';

export const metadata: Metadata = {
  title: 'Detail Ujian Kenaikan Sabuk',
  description: 'Informasi lengkap pelaksanaan ujian, dewan penguji, dan evaluasi peserta.',
};

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

function ExamDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ExamDetailContainer examId={id} />;
}

function ExamDetailFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export default function ExamDetailPage({ params }: ExamDetailPageProps) {
  return (
    <Suspense fallback={<ExamDetailFallback />}>
      <ExamDetailContent params={params} />
    </Suspense>
  );
}

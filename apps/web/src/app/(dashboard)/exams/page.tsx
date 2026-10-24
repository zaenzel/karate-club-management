import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { ExamListContainer } from '@/features/exams';

export const metadata: Metadata = {
  title: 'Ujian Kenaikan Sabuk',
  description: 'Daftar event ujian kyu dan dan, pengelolaan penguji, dan evaluasi kenaikan sabuk.',
};

function ExamListFallback() {
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

export default function ExamsPage() {
  return (
    <Suspense fallback={<ExamListFallback />}>
      <ExamListContainer />
    </Suspense>
  );
}

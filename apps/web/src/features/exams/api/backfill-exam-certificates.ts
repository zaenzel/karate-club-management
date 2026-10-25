import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface BackfillResult {
  createdCount: number;
  certificateIds: string[];
}

export async function backfillExamCertificates(examId: string): Promise<BackfillResult> {
  const { data } = await api.post<BackfillResult>(`/exams/${examId}/certificates/backfill`);
  return data;
}

export function useBackfillExamCertificates(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => backfillExamCertificates(examId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exams', examId, 'certificates'] });
      void queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

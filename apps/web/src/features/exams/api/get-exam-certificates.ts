import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';

export interface ExamCertificateItem {
  id: string;
  number: string;
  status: 'PENDING' | 'READY' | 'FAILED';
  isActive: boolean;
  issuedAt: string;
  member: {
    id: string;
    memberNumber: string;
    name: string;
  };
  grade: {
    belt: string;
    kyu: number | null;
    dan: number | null;
  };
  hasPdf: boolean;
  hasPng: boolean;
}

export async function getExamCertificates(examId: string): Promise<ExamCertificateItem[]> {
  const { data } = await api.get<Paginated<ExamCertificateItem>>('/certificates', {
    params: { examId, pageSize: 100 },
  });
  return data.data;
}

export function useExamCertificates(examId: string, enabled = true) {
  return useQuery({
    queryKey: ['exams', examId, 'certificates'],
    queryFn: () => getExamCertificates(examId),
    enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.some((cert) => cert.status === 'PENDING');
      return hasPending ? 5000 : false;
    },
  });
}

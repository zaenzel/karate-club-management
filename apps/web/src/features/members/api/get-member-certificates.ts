import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';

export interface MemberCertificateItem {
  id: string;
  number: string;
  status: 'PENDING' | 'READY' | 'FAILED';
  isActive: boolean;
  issuedAt: string;
  grade: {
    belt: string;
    kyu: number | null;
    dan: number | null;
  };
  exam: {
    id: string;
    name: string;
    date: string;
  };
  hasPdf: boolean;
  hasPng: boolean;
}

export async function getMemberCertificates(memberId: string): Promise<MemberCertificateItem[]> {
  const { data } = await api.get<Paginated<MemberCertificateItem>>('/certificates', {
    params: { memberId, pageSize: 50 },
  });
  return data.data;
}

export function useMemberCertificates(memberId: string) {
  return useQuery({
    queryKey: ['members', memberId, 'certificates'],
    queryFn: () => getMemberCertificates(memberId),
  });
}

export async function downloadMemberCertificate(
  id: string,
  format: 'pdf' | 'png' = 'pdf',
): Promise<void> {
  const { data } = await api.get<{ url: string }>(`/certificates/${id}/download`, {
    params: { format },
  });
  window.open(data.url, '_blank');
}

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Paginated } from '@/types/api';
import type { CertificateListItem, CertificateListParams } from '../types/certificate';
import { certificateKeys } from './query-keys';

export async function getCertificates(
  params: CertificateListParams = {},
): Promise<Paginated<CertificateListItem>> {
  const { data } = await api.get<Paginated<CertificateListItem>>('/certificates', {
    params,
  });
  return data;
}

export function useCertificates(params: CertificateListParams = {}) {
  return useQuery({
    queryKey: certificateKeys.list(params),
    queryFn: () => getCertificates(params),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.data.some((cert) => cert.status === 'PENDING');
      // Polling setiap 5 detik HANYA bila ada sertifikat PENDING di halaman ini
      return hasPending ? 5000 : false;
    },
  });
}

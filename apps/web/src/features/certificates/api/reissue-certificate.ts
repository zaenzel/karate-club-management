import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CertificateListItem } from '../types/certificate';
import { certificateKeys } from './query-keys';

export async function reissueCertificate(id: string): Promise<CertificateListItem> {
  const { data } = await api.post<CertificateListItem>(`/certificates/${id}/reissue`);
  return data;
}

export function useReissueCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reissueCertificate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
  });
}

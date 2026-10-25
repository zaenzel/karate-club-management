import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CertificateListItem } from '../types/certificate';
import { certificateKeys } from './query-keys';

export async function retryCertificate(id: string): Promise<CertificateListItem> {
  const { data } = await api.post<CertificateListItem>(`/certificates/${id}/retry`);
  return data;
}

export function useRetryCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryCertificate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
  });
}

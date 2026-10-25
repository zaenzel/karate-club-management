import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CertificateTemplate } from '../types/template';
import { certificateTemplateKeys } from './query-keys';

export async function activateCertificateTemplate(id: string): Promise<CertificateTemplate> {
  const { data } = await api.post<CertificateTemplate>(`/certificate-templates/${id}/activate`);
  return data;
}

export function useActivateCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateCertificateTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: certificateTemplateKeys.all });
    },
  });
}

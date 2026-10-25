import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CertificateTemplate } from '../types/template';
import { certificateTemplateKeys } from './query-keys';

export async function getCertificateTemplates(): Promise<CertificateTemplate[]> {
  const { data } = await api.get<CertificateTemplate[]>('/certificate-templates');
  return data;
}

export function useCertificateTemplates() {
  return useQuery({
    queryKey: certificateTemplateKeys.lists(),
    queryFn: getCertificateTemplates,
  });
}

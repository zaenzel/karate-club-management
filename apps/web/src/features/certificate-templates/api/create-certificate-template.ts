import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CertificateTemplate, CreateCertificateTemplatePayload } from '../types/template';
import { certificateTemplateKeys } from './query-keys';

export async function createCertificateTemplate(
  payload: CreateCertificateTemplatePayload,
): Promise<CertificateTemplate> {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('signerName', payload.signerName);
  if (payload.signerTitle) {
    formData.append('signerTitle', payload.signerTitle);
  }
  formData.append('design', payload.design);
  if (payload.signature) {
    formData.append('signature', payload.signature);
  }

  const { data } = await api.post<CertificateTemplate>('/certificate-templates', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data;
}

export function useCreateCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCertificateTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: certificateTemplateKeys.all });
    },
  });
}

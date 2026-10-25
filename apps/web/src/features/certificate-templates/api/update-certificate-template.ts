import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CertificateTemplate, UpdateCertificateTemplatePayload } from '../types/template';
import { certificateTemplateKeys } from './query-keys';

export async function updateCertificateTemplate(
  payload: UpdateCertificateTemplatePayload,
): Promise<CertificateTemplate> {
  const hasFiles = Boolean(payload.design || payload.signature);

  if (!hasFiles) {
    const { data } = await api.patch<CertificateTemplate>(`/certificate-templates/${payload.id}`, {
      name: payload.name,
      signerName: payload.signerName,
      signerTitle: payload.signerTitle,
      fieldLayout: payload.fieldLayout,
    });
    return data;
  }

  const formData = new FormData();
  if (payload.name) formData.append('name', payload.name);
  if (payload.signerName) formData.append('signerName', payload.signerName);
  if (payload.signerTitle) formData.append('signerTitle', payload.signerTitle);
  if (payload.fieldLayout) formData.append('fieldLayout', JSON.stringify(payload.fieldLayout));
  if (payload.design) formData.append('design', payload.design);
  if (payload.signature) formData.append('signature', payload.signature);

  const { data } = await api.patch<CertificateTemplate>(
    `/certificate-templates/${payload.id}`,
    formData,
    {
      headers: { 'Content-Type': undefined },
    },
  );
  return data;
}

export function useUpdateCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCertificateTemplate,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: certificateTemplateKeys.all });
      void queryClient.invalidateQueries({
        queryKey: certificateTemplateKeys.detail(data.id),
      });
    },
  });
}

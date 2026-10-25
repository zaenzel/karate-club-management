import { api } from '@/lib/api-client';

export async function downloadExamCertificate(
  id: string,
  format: 'pdf' | 'png' = 'pdf',
): Promise<void> {
  const { data } = await api.get<{ url: string }>(`/certificates/${id}/download`, {
    params: { format },
  });
  window.open(data.url, '_blank');
}

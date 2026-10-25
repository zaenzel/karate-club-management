import { api } from '@/lib/api-client';

export async function getCertificateDownloadUrl(
  id: string,
  format: 'pdf' | 'png' = 'pdf',
): Promise<string> {
  const { data } = await api.get<{ url: string }>(`/certificates/${id}/download`, {
    params: { format },
  });
  return data.url;
}

export async function downloadCertificateFile(
  id: string,
  format: 'pdf' | 'png' = 'pdf',
): Promise<void> {
  const url = await getCertificateDownloadUrl(id, format);
  // Buka URL presigned untuk memulai unduhan browser
  window.open(url, '_blank');
}

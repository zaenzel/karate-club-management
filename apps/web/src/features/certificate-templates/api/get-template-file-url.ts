import { api } from '@/lib/api-client';

export async function getTemplateDesignUrl(templateId: string): Promise<string> {
  const { data } = await api.get<{ url: string }>(
    `/certificate-templates/${templateId}/files/design`,
  );
  return data.url;
}

export async function getTemplateSignatureUrl(templateId: string): Promise<string> {
  const { data } = await api.get<{ url: string }>(
    `/certificate-templates/${templateId}/files/signature`,
  );
  return data.url;
}

export async function getTemplatePreviewUrl(templateId: string): Promise<string> {
  const { data } = await api.get<{ url: string }>(
    `/certificate-templates/${templateId}/files/preview`,
  );
  return data.url;
}

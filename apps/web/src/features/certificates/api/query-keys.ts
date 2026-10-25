import type { CertificateListParams } from '../types/certificate';

export const certificateKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificateKeys.all, 'list'] as const,
  list: (params: CertificateListParams) => [...certificateKeys.lists(), params] as const,
  details: () => [...certificateKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificateKeys.details(), id] as const,
};

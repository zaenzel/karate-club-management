export const certificateTemplateKeys = {
  all: ['certificate-templates'] as const,
  lists: () => [...certificateTemplateKeys.all, 'list'] as const,
  details: () => [...certificateTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificateTemplateKeys.details(), id] as const,
};

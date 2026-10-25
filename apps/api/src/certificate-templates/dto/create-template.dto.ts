import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Nama template wajib diisi').max(100),
  signerName: z.string().trim().min(1, 'Nama penandatangan wajib diisi').max(100),
  signerTitle: z.string().trim().min(1).max(100).default('Ketua'),
  paperSize: z.string().trim().default('A4'),
  fieldLayout: z.record(z.string(), z.any()).optional(),
});

export type CreateTemplateDto = z.infer<typeof createTemplateSchema>;

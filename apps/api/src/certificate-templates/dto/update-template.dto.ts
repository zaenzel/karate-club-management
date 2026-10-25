import { z } from 'zod';

export const updateTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Nama template wajib diisi').max(100).optional(),
  signerName: z.string().trim().min(1, 'Nama penandatangan wajib diisi').max(100).optional(),
  signerTitle: z.string().trim().min(1).max(100).optional(),
  fieldLayout: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    }, z.record(z.string(), z.any()).nullable().optional())
    .optional(),
});

export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>;

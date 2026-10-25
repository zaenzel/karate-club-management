import { z } from 'zod';

export const templateFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama template wajib diisi').max(100),
  signerName: z.string().trim().min(1, 'Nama penandatangan wajib diisi').max(100),
  signerTitle: z.string().trim().min(1, 'Jabatan wajib diisi').max(100),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;

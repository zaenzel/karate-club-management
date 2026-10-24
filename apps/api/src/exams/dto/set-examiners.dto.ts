import { z } from 'zod';

export const examinerItemSchema = z.object({
  name: z
    .string({ error: 'Nama penguji wajib diisi' })
    .trim()
    .min(1, 'Nama penguji wajib diisi')
    .max(150, 'Nama penguji maksimal 150 karakter'),
  isChief: z.boolean().default(false),
});

export const setExaminersSchema = z
  .object({
    examiners: z
      .array(examinerItemSchema)
      .min(1, 'Minimal satu penguji harus didaftarkan')
      .max(10, 'Maksimal 10 penguji diperbolehkan'),
  })
  .refine(
    (data) => {
      const chiefCount = data.examiners.filter((e) => e.isChief).length;
      return chiefCount <= 1;
    },
    {
      message: 'Hanya boleh maksimal satu ketua penguji',
      path: ['examiners'],
    },
  );

export type SetExaminersDto = z.infer<typeof setExaminersSchema>;

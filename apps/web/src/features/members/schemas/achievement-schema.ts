import { z } from 'zod';

export const achievementFormSchema = z.object({
  championship: z
    .string()
    .trim()
    .min(2, 'Nama kejuaraan minimal 2 karakter')
    .max(150, 'Nama kejuaraan maksimal 150 karakter'),
  level: z.enum(['CITY', 'PROVINCE', 'NATIONAL', 'INTERNATIONAL', 'OTHER'], {
    error: 'Pilih tingkat kejuaraan',
  }),
  category: z.string().trim().max(100, 'Kategori maksimal 100 karakter').optional(),
  result: z
    .string()
    .trim()
    .min(1, 'Hasil / pencapaian wajib diisi')
    .max(100, 'Hasil maksimal 100 karakter'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .refine((val) => {
      const parsed = Date.parse(val);
      if (Number.isNaN(parsed)) return false;
      const today = new Date().toISOString().slice(0, 10);
      return val <= today;
    }, 'Tanggal kejuaraan tidak boleh di masa depan'),
  location: z.string().trim().max(150, 'Lokasi maksimal 150 karakter').optional(),
});

export type AchievementFormValues = z.infer<typeof achievementFormSchema>;

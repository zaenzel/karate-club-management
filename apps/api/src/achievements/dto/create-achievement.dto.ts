import { AchievementLevel } from '@karate/db';
import { z } from 'zod';

export const createAchievementSchema = z.object({
  championship: z
    .string({ error: 'Nama kejuaraan wajib diisi' })
    .trim()
    .min(2, 'Nama kejuaraan minimal 2 karakter')
    .max(150, 'Nama kejuaraan maksimal 150 karakter'),
  level: z
    .nativeEnum(AchievementLevel, {
      error: 'Tingkat kejuaraan tidak valid',
    })
    .default(AchievementLevel.OTHER),
  category: z.string().trim().max(100, 'Kategori maksimal 100 karakter').optional().nullable(),
  result: z
    .string({ error: 'Hasil / pencapaian wajib diisi' })
    .trim()
    .min(1, 'Hasil / pencapaian wajib diisi')
    .max(100, 'Hasil maksimal 100 karakter'),
  date: z
    .string({ error: 'Tanggal wajib diisi' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .refine((val) => {
      const parsed = Date.parse(val);
      if (Number.isNaN(parsed)) return false;
      const today = new Date().toISOString().slice(0, 10);
      return val <= today;
    }, 'Tanggal kejuaraan tidak boleh di masa depan'),
  location: z.string().trim().max(150, 'Lokasi maksimal 150 karakter').optional().nullable(),
});

export type CreateAchievementDto = z.infer<typeof createAchievementSchema>;

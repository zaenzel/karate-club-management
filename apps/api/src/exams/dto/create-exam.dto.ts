import { ExamType } from '@karate/db';
import { z } from 'zod';

export const createExamSchema = z.object({
  name: z
    .string({ error: 'Nama ujian wajib diisi' })
    .trim()
    .min(3, 'Nama ujian minimal 3 karakter')
    .max(150, 'Nama ujian maksimal 150 karakter'),
  type: z.nativeEnum(ExamType, {
    error: 'Jenis ujian harus KYU atau DAN',
  }),
  date: z
    .string({ error: 'Tanggal ujian wajib diisi' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .refine((val) => !Number.isNaN(Date.parse(val)), 'Tanggal ujian tidak valid'),
  location: z
    .string({ error: 'Tempat ujian wajib diisi' })
    .trim()
    .min(1, 'Tempat ujian wajib diisi')
    .max(255, 'Tempat ujian maksimal 255 karakter'),
  baseFee: z
    .number({ error: 'Biaya dasar wajib diisi' })
    .int('Biaya dasar harus berupa bilangan bulat')
    .min(0, 'Biaya dasar tidak boleh negatif')
    .default(0),
  branchId: z.string().uuid('ID cabang tidak valid').optional().nullable(),
});

export type CreateExamDto = z.infer<typeof createExamSchema>;

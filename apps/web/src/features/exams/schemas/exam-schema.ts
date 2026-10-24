import { z } from 'zod';

export const examSchema = z.object({
  name: z
    .string({ error: 'Nama ujian wajib diisi' })
    .trim()
    .min(3, 'Nama ujian minimal 3 karakter')
    .max(150, 'Nama ujian maksimal 150 karakter'),
  type: z.enum(['KYU', 'DAN'], {
    error: 'Jenis ujian harus KYU atau DAN',
  }),
  date: z
    .string({ error: 'Tanggal ujian wajib diisi' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  location: z
    .string({ error: 'Tempat ujian wajib diisi' })
    .trim()
    .min(1, 'Tempat ujian wajib diisi')
    .max(255, 'Tempat ujian maksimal 255 karakter'),
  baseFee: z
    .number({ error: 'Biaya dasar wajib diisi' })
    .int('Biaya dasar harus berupa bilangan bulat')
    .min(0, 'Biaya dasar tidak boleh negatif'),
  branchId: z.string().uuid('ID cabang tidak valid').optional().nullable().or(z.literal('')),
});

export type ExamFormValues = z.infer<typeof examSchema>;

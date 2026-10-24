import { MemberType } from '@karate/db';
import { z } from 'zod';

export const initialGradeSchema = z.object({
  beltId: z.string().uuid('ID sabuk tidak valid'),
  kyu: z.number(),
  dan: z
    .number()
    .int('Tingkatan dan harus berupa bilangan bulat')
    .min(1, 'Tingkatan dan minimal 1')
    .optional()
    .nullable(),
});

export const createMemberSchema = z.object({
  type: z.nativeEnum(MemberType, {
    error: 'Tipe member harus COACH atau STUDENT',
  }),
  name: z
    .string({ error: 'Nama wajib diisi' })
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  birthPlace: z
    .string({ error: 'Tempat lahir wajib diisi' })
    .trim()
    .min(1, 'Tempat lahir wajib diisi')
    .max(100, 'Tempat lahir maksimal 100 karakter'),
  birthDate: z
    .string({ error: 'Tanggal lahir wajib diisi' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir harus YYYY-MM-DD')
    .refine((val) => {
      const parsed = Date.parse(val);
      if (Number.isNaN(parsed)) return false;
      const today = new Date().toISOString().slice(0, 10);
      return val <= today;
    }, 'Tanggal lahir tidak valid atau berada di masa depan'),
  address: z
    .string({ error: 'Alamat wajib diisi' })
    .trim()
    .min(1, 'Alamat wajib diisi')
    .max(255, 'Alamat maksimal 255 karakter'),
  phone: z.string().trim().max(20, 'Nomor telepon maksimal 20 karakter').optional().nullable(),
  branchId: z.string().uuid('ID cabang tidak valid'),
  initialGrade: initialGradeSchema.optional().nullable(),
});

export type CreateMemberDto = z.infer<typeof createMemberSchema>;

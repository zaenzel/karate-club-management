import { MemberType } from '@karate/db';
import { z } from 'zod';

export const updateMemberSchema = z
  .object({
    type: z
      .nativeEnum(MemberType, {
        error: 'Tipe member harus COACH atau STUDENT',
      })
      .optional(),
    name: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter')
      .optional(),
    birthPlace: z
      .string()
      .trim()
      .min(1, 'Tempat lahir wajib diisi')
      .max(100, 'Tempat lahir maksimal 100 karakter')
      .optional(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir harus YYYY-MM-DD')
      .refine((val) => {
        const parsed = Date.parse(val);
        if (Number.isNaN(parsed)) return false;
        const today = new Date().toISOString().slice(0, 10);
        return val <= today;
      }, 'Tanggal lahir tidak valid atau berada di masa depan')
      .optional(),
    address: z
      .string()
      .trim()
      .min(1, 'Alamat wajib diisi')
      .max(255, 'Alamat maksimal 255 karakter')
      .optional(),
    phone: z.string().trim().max(20, 'Nomor telepon maksimal 20 karakter').optional().nullable(),
    branchId: z.string().uuid('ID cabang tidak valid').optional(),
  })
  .strict();

export type UpdateMemberDto = z.infer<typeof updateMemberSchema>;

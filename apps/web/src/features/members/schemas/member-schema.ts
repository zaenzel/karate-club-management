import { z } from 'zod';

import { KYU_MAX, KYU_MIN, KYU_STEP } from '../types/grade';

export function isValidKyuClient(kyu: number): boolean {
  if (typeof kyu !== 'number' || Number.isNaN(kyu)) return false;
  if (kyu < KYU_MIN || kyu > KYU_MAX) return false;
  const multiplier = kyu / KYU_STEP;
  return Math.abs(multiplier - Math.round(multiplier)) < 1e-9;
}

export const memberCreateSchema = z
  .object({
    type: z.enum(['COACH', 'STUDENT'], {
      error: 'Pilih tipe member',
    }),
    name: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter'),
    birthPlace: z
      .string()
      .trim()
      .min(1, 'Tempat lahir wajib diisi')
      .max(100, 'Tempat lahir maksimal 100 karakter'),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir harus YYYY-MM-DD')
      .refine((val) => {
        const parsed = Date.parse(val);
        if (Number.isNaN(parsed)) return false;
        const today = new Date().toISOString().slice(0, 10);
        return val <= today;
      }, 'Tanggal lahir tidak boleh di masa depan'),
    address: z
      .string()
      .trim()
      .min(1, 'Alamat wajib diisi')
      .max(255, 'Alamat maksimal 255 karakter'),
    phone: z.string().trim().max(20, 'Nomor telepon maksimal 20 karakter').optional(),
    branchId: z.string().min(1, 'Pilih cabang asal'),
    hasInitialGrade: z.boolean().default(false),
    initialBeltId: z.string().optional(),
    initialBeltOrder: z.number().optional(),
    initialKyu: z.coerce.number().optional(),
    initialDan: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasInitialGrade) {
      if (!data.initialBeltId || data.initialBeltId.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Pilih sabuk awal',
          path: ['initialBeltId'],
        });
      }

      if (data.initialKyu === undefined || !isValidKyuClient(data.initialKyu)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nilai kyu harus antara 0 sampai 10 dan kelipatan 0.5',
          path: ['initialKyu'],
        });
      }

      const isBlack = data.initialBeltOrder === 6;
      if (isBlack) {
        if (data.initialKyu !== 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Sabuk hitam hanya diperbolehkan bila kyu bernilai 0',
            path: ['initialKyu'],
          });
        }
        if (
          data.initialDan !== undefined &&
          (!Number.isInteger(data.initialDan) || data.initialDan < 1)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Tingkatan dan harus berupa bilangan bulat minimal 1',
            path: ['initialDan'],
          });
        }
      } else {
        if (data.initialDan !== undefined && data.initialDan > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Tingkatan dan hanya berlaku untuk sabuk hitam',
            path: ['initialDan'],
          });
        }
      }
    }
  });

export type MemberCreateFormValues = z.infer<typeof memberCreateSchema>;

export const memberUpdateSchema = z.object({
  type: z.enum(['COACH', 'STUDENT'], {
    error: 'Pilih tipe member',
  }),
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  birthPlace: z
    .string()
    .trim()
    .min(1, 'Tempat lahir wajib diisi')
    .max(100, 'Tempat lahir maksimal 100 karakter'),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir harus YYYY-MM-DD')
    .refine((val) => {
      const parsed = Date.parse(val);
      if (Number.isNaN(parsed)) return false;
      const today = new Date().toISOString().slice(0, 10);
      return val <= today;
    }, 'Tanggal lahir tidak boleh di masa depan'),
  address: z.string().trim().min(1, 'Alamat wajib diisi').max(255, 'Alamat maksimal 255 karakter'),
  phone: z.string().trim().max(20, 'Nomor telepon maksimal 20 karakter').optional(),
  branchId: z.string().min(1, 'Pilih cabang asal'),
});

export type MemberUpdateFormValues = z.infer<typeof memberUpdateSchema>;

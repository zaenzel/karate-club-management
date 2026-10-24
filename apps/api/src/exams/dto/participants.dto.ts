import { ExamResult, PaymentStatus } from '@karate/db';
import { z } from 'zod';

export const addParticipantsSchema = z.object({
  memberIds: z
    .array(z.string().uuid('ID member tidak valid'))
    .min(1, 'Minimal satu member harus dipilih')
    .max(200, 'Maksimal 200 member dapat didaftarkan sekaligus'),
});

export type AddParticipantsDto = z.infer<typeof addParticipantsSchema>;

export const updatePaymentSchema = z
  .object({
    fee: z.number().int('Biaya harus berupa bilangan bulat').min(0, 'Biaya tidak boleh negatif').optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  })
  .refine((data) => data.fee !== undefined || data.paymentStatus !== undefined, {
    message: 'Setidaknya salah satu field (biaya atau status pembayaran) harus diisi',
  });

export type UpdatePaymentDto = z.infer<typeof updatePaymentSchema>;

export const updateResultSchema = z.object({
  result: z.nativeEnum(ExamResult, { error: 'Hasil ujian tidak valid' }),
  kyuDecrease: z.number().positive('Penurunan kyu harus lebih besar dari 0').optional(),
  danIncrease: z.number().int('Kenaikan dan harus bilangan bulat').min(1, 'Kenaikan dan minimal 1').optional(),
  toBeltId: z.string().uuid('ID sabuk tujuan tidak valid').optional().nullable(),
});

export type UpdateResultDto = z.infer<typeof updateResultSchema>;

export const listParticipantsQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  result: z.nativeEnum(ExamResult).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
});

export type ListParticipantsQuery = z.infer<typeof listParticipantsQuerySchema>;

export const eligibleMembersQuerySchema = z.object({
  q: z.string().trim().optional(),
  branchId: z.string().uuid().optional(),
});

export type EligibleMembersQuery = z.infer<typeof eligibleMembersQuerySchema>;

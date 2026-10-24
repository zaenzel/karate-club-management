import { z } from 'zod';
import type { ExamBeltInfo, ExamResult } from '../types/participant';
import type { ExamType } from '../types/exam';

export const participantResultSchema = z.object({
  result: z.enum(['PASSED', 'FAILED'], {
    error: 'Hasil ujian wajib dipilih (Lulus / Tidak lulus)',
  }),
  kyuDecrease: z
    .number()
    .positive('Penurunan kyu harus lebih besar dari 0')
    .refine((val) => {
      const mult = val / 0.5;
      return Math.abs(mult - Math.round(mult)) < 1e-9;
    }, 'Penurunan kyu harus merupakan kelipatan 0.5')
    .optional(),
  danIncrease: z
    .number()
    .int('Kenaikan dan harus berupa bilangan bulat')
    .min(1, 'Kenaikan dan minimal 1')
    .optional(),
  toBeltId: z.string().optional(),
});

export type ParticipantResultFormValues = z.infer<typeof participantResultSchema>;

export interface PreviewGradeParams {
  examType: ExamType;
  fromBelt: ExamBeltInfo;
  fromKyu: number;
  fromDan?: number | null;
  result: ExamResult;
  kyuDecrease?: number;
  danIncrease?: number;
  targetBelt?: ExamBeltInfo | null;
  blackBeltOrder?: number;
}

export interface PreviewGradeResult {
  belt: ExamBeltInfo;
  kyu: number;
  dan: number | null;
  error?: string;
}

export function previewGradeResult({
  examType,
  fromBelt,
  fromKyu,
  fromDan,
  result,
  kyuDecrease = 1,
  danIncrease = 1,
  targetBelt,
  blackBeltOrder = 6,
}: PreviewGradeParams): PreviewGradeResult | null {
  if (result === 'FAILED') {
    return null;
  }

  const destinationBelt = targetBelt ?? fromBelt;

  if (examType === 'KYU') {
    if (fromBelt.order >= blackBeltOrder) {
      return {
        belt: fromBelt,
        kyu: 0,
        dan: fromDan ?? 1,
        error: 'Member hitam tidak dapat mengikuti ujian KYU',
      };
    }

    const toKyu = Math.round((fromKyu - kyuDecrease) * 2) / 2;
    if (toKyu < 0) {
      return {
        belt: destinationBelt,
        kyu: toKyu,
        dan: null,
        error: 'Kyu hasil tidak boleh kurang dari 0',
      };
    }

    if (destinationBelt.order < fromBelt.order) {
      return {
        belt: destinationBelt,
        kyu: toKyu,
        dan: null,
        error: 'Warna sabuk baru tidak boleh lebih rendah',
      };
    }

    if (destinationBelt.order === blackBeltOrder && toKyu !== 0) {
      return {
        belt: destinationBelt,
        kyu: toKyu,
        dan: null,
        error: 'Sabuk hitam hanya jika kyu hasil = 0',
      };
    }

    if (destinationBelt.order < blackBeltOrder && toKyu === 0) {
      return {
        belt: destinationBelt,
        kyu: toKyu,
        dan: null,
        error: 'Kyu 0 hanya berlaku untuk sabuk hitam',
      };
    }

    const toDan = destinationBelt.order === blackBeltOrder ? 1 : null;
    return {
      belt: destinationBelt,
      kyu: toKyu,
      dan: toDan,
    };
  }

  if (examType === 'DAN') {
    if (fromBelt.order < blackBeltOrder) {
      return {
        belt: fromBelt,
        kyu: fromKyu,
        dan: fromDan ?? null,
        error: 'Ujian DAN hanya untuk member bersabuk hitam',
      };
    }

    const currentDan = fromDan && fromDan >= 1 ? fromDan : 1;
    return {
      belt: fromBelt,
      kyu: 0,
      dan: currentDan + danIncrease,
    };
  }

  return null;
}

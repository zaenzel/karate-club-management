export const KYU_MIN = 0;
export const KYU_MAX = 10;
export const KYU_STEP = 0.5;
export const DEFAULT_BLACK_BELT_ORDER = 6;

export function isValidKyu(kyu: number): boolean {
  if (typeof kyu !== 'number' || Number.isNaN(kyu)) {
    return false;
  }
  if (kyu < KYU_MIN || kyu > KYU_MAX) {
    return false;
  }
  // Memastikan kelipatan KYU_STEP (0.5), dengan toleransi floating point
  const multiplier = kyu / KYU_STEP;
  return Math.abs(multiplier - Math.round(multiplier)) < 1e-9;
}

export type ValidateGradeParams = {
  beltOrder: number;
  kyu: number;
  dan?: number | null;
  blackOrder?: number;
};

export function validateGrade({
  beltOrder,
  kyu,
  dan,
  blackOrder = DEFAULT_BLACK_BELT_ORDER,
}: ValidateGradeParams): string[] {
  const errors: string[] = [];

  if (!isValidKyu(kyu)) {
    errors.push(
      `Nilai kyu harus berada dalam rentang ${KYU_MIN} sampai ${KYU_MAX} dan merupakan kelipatan ${KYU_STEP}`,
    );
  }

  const isBlackBelt = beltOrder === blackOrder;

  if (isBlackBelt) {
    if (kyu !== 0) {
      errors.push('Sabuk hitam hanya diperbolehkan bila kyu bernilai 0');
    }
    if (dan === null || dan === undefined || !Number.isInteger(dan) || dan < 1) {
      errors.push('Sabuk hitam wajib memiliki tingkatan dan berupa bilangan bulat minimal 1');
    }
  } else {
    if (dan !== null && dan !== undefined) {
      errors.push('Tingkatan dan hanya berlaku untuk sabuk hitam');
    }
  }

  return errors;
}

export type ComputeResultParams = {
  examType: 'KYU' | 'DAN';
  from: { beltOrder: number; kyu: number; dan?: number | null };
  kyuDecrease?: number;
  danIncrease?: number;
  toBeltOrder?: number;
  blackOrder?: number;
};

export type ComputeResultOutput =
  | { ok: true; to: { beltOrder: number; kyu: number; dan: number | null } }
  | { ok: false; errors: string[] };

export function computeResultGrade({
  examType,
  from,
  kyuDecrease,
  danIncrease,
  toBeltOrder,
  blackOrder = DEFAULT_BLACK_BELT_ORDER,
}: ComputeResultParams): ComputeResultOutput {
  const errors: string[] = [];
  const fromIsBlack = from.beltOrder === blackOrder;

  if (examType === 'KYU') {
    if (fromIsBlack) {
      errors.push('Member bersabuk hitam tidak dapat mengikuti ujian KYU');
      return { ok: false, errors };
    }

    const decrease = kyuDecrease ?? 1;
    if (typeof decrease !== 'number' || Number.isNaN(decrease) || decrease <= 0) {
      errors.push('Penurunan kyu harus lebih besar dari 0');
    } else {
      const mult = decrease / KYU_STEP;
      if (Math.abs(mult - Math.round(mult)) > 1e-9) {
        errors.push(`Penurunan kyu harus merupakan kelipatan ${KYU_STEP}`);
      }
    }

    const fromHalf = Math.round(from.kyu * 2);
    const decHalf = Math.round((kyuDecrease ?? 1) * 2);
    const toHalf = fromHalf - decHalf;
    const toKyu = toHalf / 2;

    if (toKyu < 0) {
      errors.push('Nilai kyu hasil tidak boleh kurang dari 0');
    }

    const targetBeltOrder = toBeltOrder ?? from.beltOrder;
    if (targetBeltOrder < from.beltOrder) {
      errors.push('Warna sabuk baru tidak boleh lebih rendah dari warna sabuk sebelumnya');
    }

    if (targetBeltOrder === blackOrder) {
      if (toKyu !== 0) {
        errors.push('Sabuk hitam hanya diperbolehkan bila kyu hasil bernilai 0');
      }
    } else {
      if (toKyu === 0) {
        errors.push('Kyu 0 hanya berlaku untuk sabuk hitam');
      }
    }

    if (errors.length > 0) {
      return { ok: false, errors };
    }

    const toDan = targetBeltOrder === blackOrder ? 1 : null;
    return {
      ok: true,
      to: {
        beltOrder: targetBeltOrder,
        kyu: toKyu,
        dan: toDan,
      },
    };
  }

  if (examType === 'DAN') {
    if (!fromIsBlack) {
      errors.push('Ujian DAN hanya dapat diikuti oleh member bersabuk hitam');
      return { ok: false, errors };
    }

    const increase = danIncrease ?? 1;
    if (!Number.isInteger(increase) || increase < 1) {
      errors.push('Kenaikan tingkatan dan harus berupa bilangan bulat minimal 1');
    }

    if (errors.length > 0) {
      return { ok: false, errors };
    }

    const currentDan = from.dan && from.dan >= 1 ? from.dan : 1;
    return {
      ok: true,
      to: {
        beltOrder: blackOrder,
        kyu: 0,
        dan: currentDan + increase,
      },
    };
  }

  return { ok: false, errors: ['Jenis ujian tidak valid'] };
}

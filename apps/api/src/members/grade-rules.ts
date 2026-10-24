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

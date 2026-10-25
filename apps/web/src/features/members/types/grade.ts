export const KYU_MIN = 0;
export const KYU_MAX = 10;
export const KYU_STEP = 0.5;
export const DEFAULT_BLACK_BELT_ORDER = 6;

export function formatKyu(kyu: number): string {
  if (kyu % 1 === 0) {
    return kyu.toString();
  }
  return kyu.toString().replace('.', ',');
}

export function formatGradeSummary(
  beltName: string,
  kyu: number | null | undefined,
  dan: number | null | undefined,
): string {
  if (dan !== null && dan !== undefined && dan > 0) {
    return `${beltName}, Dan ${dan}`;
  }
  if (kyu !== null && kyu !== undefined) {
    return `${beltName}, Kyu ${formatKyu(kyu)}`;
  }
  return beltName;
}

export function formatBirthDate(dateStr: string): string {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;

  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

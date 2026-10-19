/** Decimal Prisma (kyu) dikirim sebagai number, mis. 9.5. */
export function toNumber(value: { toNumber(): number }): number {
  return value.toNumber();
}

/**
 * Kolom `@db.Date` dibaca Prisma sebagai tengah malam UTC, jadi mengambil bagian tanggal dari ISO
 * string aman dari pergeseran zona waktu.
 */
export function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

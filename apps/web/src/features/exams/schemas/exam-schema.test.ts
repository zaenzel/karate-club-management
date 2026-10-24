import { describe, expect, it } from 'vitest';
import { examSchema } from './exam-schema';

describe('examSchema', () => {
  it('menerima input valid', () => {
    const valid = {
      name: 'Ujian Kenaikan Tingkat Kyu 2026',
      type: 'KYU',
      date: '2026-11-20',
      location: 'Dojo Pusat Jakarta',
      baseFee: 150000,
      branchId: '',
    };
    expect(examSchema.safeParse(valid).success).toBe(true);
  });

  it('menolak nama kurang dari 3 karakter', () => {
    const invalid = {
      name: 'Uj',
      type: 'KYU',
      date: '2026-11-20',
      location: 'Dojo Pusat',
      baseFee: 0,
    };
    const res = examSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('menolak biaya negatif', () => {
    const invalid = {
      name: 'Ujian Dan',
      type: 'DAN',
      date: '2026-11-20',
      location: 'Dojo Pusat',
      baseFee: -100,
    };
    const res = examSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('menolak format tanggal yang salah', () => {
    const invalid = {
      name: 'Ujian Dan',
      type: 'DAN',
      date: '20-11-2026',
      location: 'Dojo Pusat',
      baseFee: 100000,
    };
    const res = examSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

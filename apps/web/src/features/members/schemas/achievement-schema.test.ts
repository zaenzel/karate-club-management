import { describe, expect, it } from 'vitest';

import { achievementFormSchema } from './achievement-schema';

describe('achievementFormSchema', () => {
  it('validasi lolos dengan data prestasi lengkap', () => {
    const result = achievementFormSchema.safeParse({
      championship: 'Kejurnas Karate Senior 2026',
      level: 'NATIONAL',
      category: 'Kumite Putra -60kg',
      result: 'Juara 1 (Emas)',
      date: '2026-03-01',
      location: 'Istora Senayan, Jakarta',
    });

    expect(result.success).toBe(true);
  });

  it('menolak bila nama kejuaraan atau hasil kosong', () => {
    const result = achievementFormSchema.safeParse({
      championship: '',
      level: 'CITY',
      result: '',
      date: '2026-01-01',
    });

    expect(result.success).toBe(false);
  });

  it('menolak tanggal kejuaraan di masa depan', () => {
    const result = achievementFormSchema.safeParse({
      championship: 'Kejurnas Masa Depan',
      level: 'NATIONAL',
      result: 'Juara 1',
      date: '2099-12-31',
    });

    expect(result.success).toBe(false);
  });
});

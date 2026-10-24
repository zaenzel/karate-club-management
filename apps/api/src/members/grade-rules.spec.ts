import { describe, expect, it } from 'vitest';

import { computeResultGrade, isValidKyu, validateGrade } from './grade-rules.js';

describe('isValidKyu', () => {
  it('menerima kyu valid: 10, 9.5, 5, 0.5, 0', () => {
    expect(isValidKyu(10)).toBe(true);
    expect(isValidKyu(9.5)).toBe(true);
    expect(isValidKyu(5)).toBe(true);
    expect(isValidKyu(0.5)).toBe(true);
    expect(isValidKyu(0)).toBe(true);
  });

  it('menolak kyu di luar rentang: 10.5, -0.5, 11', () => {
    expect(isValidKyu(10.5)).toBe(false);
    expect(isValidKyu(-0.5)).toBe(false);
    expect(isValidKyu(11)).toBe(false);
  });

  it('menolak kyu yang bukan kelipatan 0.5: 9.3, 7.25, 0.1', () => {
    expect(isValidKyu(9.3)).toBe(false);
    expect(isValidKyu(7.25)).toBe(false);
    expect(isValidKyu(0.1)).toBe(false);
  });
});

describe('validateGrade', () => {
  it('menerima tingkatan non-hitam dengan kyu valid dan tanpa dan', () => {
    // Sabuk putih (order 1), kyu 10
    expect(validateGrade({ beltOrder: 1, kyu: 10 })).toEqual([]);
    // Sabuk biru (order 4), kyu 5
    expect(validateGrade({ beltOrder: 4, kyu: 5, dan: null })).toEqual([]);
    // Sabuk cokelat (order 5), kyu 0.5
    expect(validateGrade({ beltOrder: 5, kyu: 0.5 })).toEqual([]);
  });

  it('menolak tingkatan non-hitam jika memiliki dan', () => {
    const errors = validateGrade({ beltOrder: 4, kyu: 5, dan: 1 });
    expect(errors).toContain('Tingkatan dan hanya berlaku untuk sabuk hitam');
  });

  it('menerima sabuk hitam jika kyu 0 dan dan >= 1', () => {
    expect(validateGrade({ beltOrder: 6, kyu: 0, dan: 1 })).toEqual([]);
    expect(validateGrade({ beltOrder: 6, kyu: 0, dan: 2 })).toEqual([]);
  });

  it('menolak sabuk hitam jika kyu bukan 0', () => {
    const errors = validateGrade({ beltOrder: 6, kyu: 1, dan: 1 });
    expect(errors).toContain('Sabuk hitam hanya diperbolehkan bila kyu bernilai 0');
  });

  it('menolak sabuk hitam tanpa dan atau dan < 1', () => {
    expect(validateGrade({ beltOrder: 6, kyu: 0, dan: null })).toContain(
      'Sabuk hitam wajib memiliki tingkatan dan berupa bilangan bulat minimal 1',
    );
    expect(validateGrade({ beltOrder: 6, kyu: 0, dan: 0 })).toContain(
      'Sabuk hitam wajib memiliki tingkatan dan berupa bilangan bulat minimal 1',
    );
    expect(validateGrade({ beltOrder: 6, kyu: 0, dan: 1.5 })).toContain(
      'Sabuk hitam wajib memiliki tingkatan dan berupa bilangan bulat minimal 1',
    );
  });

  it('menolak jika kyu tidak valid', () => {
    const errors = validateGrade({ beltOrder: 2, kyu: 9.3 });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('computeResultGrade', () => {
  it('10 turun 1 jadi 9', () => {
    const res = computeResultGrade({
      examType: 'KYU',
      from: { beltOrder: 1, kyu: 10 },
      kyuDecrease: 1,
      toBeltOrder: 1,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.to).toEqual({ beltOrder: 1, kyu: 9, dan: null });
    }
  });

  it('10 turun 0.5 jadi 9.5', () => {
    const res = computeResultGrade({
      examType: 'KYU',
      from: { beltOrder: 1, kyu: 10 },
      kyuDecrease: 0.5,
      toBeltOrder: 1,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.to).toEqual({ beltOrder: 1, kyu: 9.5, dan: null });
    }
  });

  it('1 turun 2 ditolak (karena kyu < 0)', () => {
    const res = computeResultGrade({
      examType: 'KYU',
      from: { beltOrder: 5, kyu: 1 },
      kyuDecrease: 2,
      toBeltOrder: 5,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors).toContain('Nilai kyu hasil tidak boleh kurang dari 0');
    }
  });

  it('1 turun 1 ke hitam valid dan menghasilkan dan 1', () => {
    const res = computeResultGrade({
      examType: 'KYU',
      from: { beltOrder: 5, kyu: 1 },
      kyuDecrease: 1,
      toBeltOrder: 6, // black
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.to).toEqual({ beltOrder: 6, kyu: 0, dan: 1 });
    }
  });

  it('2 turun 1 ke hitam ditolak (karena kyu hasil = 1 != 0)', () => {
    const res = computeResultGrade({
      examType: 'KYU',
      from: { beltOrder: 5, kyu: 2 },
      kyuDecrease: 1,
      toBeltOrder: 6,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors).toContain('Sabuk hitam hanya diperbolehkan bila kyu hasil bernilai 0');
    }
  });

  it('biru ke hijau ditolak (warna tidak boleh turun)', () => {
    // biru (order 4) ke hijau (order 3)
    const res = computeResultGrade({
      examType: 'KYU',
      from: { beltOrder: 4, kyu: 5 },
      kyuDecrease: 1,
      toBeltOrder: 3,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors).toContain(
        'Warna sabuk baru tidak boleh lebih rendah dari warna sabuk sebelumnya',
      );
    }
  });

  it('ujian DAN untuk non-hitam ditolak', () => {
    const res = computeResultGrade({
      examType: 'DAN',
      from: { beltOrder: 5, kyu: 1 },
      danIncrease: 1,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors).toContain('Ujian DAN hanya dapat diikuti oleh member bersabuk hitam');
    }
  });

  it('ujian KYU untuk member hitam ditolak', () => {
    const res = computeResultGrade({
      examType: 'KYU',
      from: { beltOrder: 6, kyu: 0, dan: 1 },
      kyuDecrease: 1,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors).toContain('Member bersabuk hitam tidak dapat mengikuti ujian KYU');
    }
  });

  it('ujian DAN: dan 1 + 1 = 2', () => {
    const res = computeResultGrade({
      examType: 'DAN',
      from: { beltOrder: 6, kyu: 0, dan: 1 },
      danIncrease: 1,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.to).toEqual({ beltOrder: 6, kyu: 0, dan: 2 });
    }
  });

  it('ujian DAN: dan 2 + 2 = 4', () => {
    const res = computeResultGrade({
      examType: 'DAN',
      from: { beltOrder: 6, kyu: 0, dan: 2 },
      danIncrease: 2,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.to).toEqual({ beltOrder: 6, kyu: 0, dan: 4 });
    }
  });
});

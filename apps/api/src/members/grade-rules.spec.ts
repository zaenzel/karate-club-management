import { describe, expect, it } from 'vitest';

import { isValidKyu, validateGrade } from './grade-rules.js';

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

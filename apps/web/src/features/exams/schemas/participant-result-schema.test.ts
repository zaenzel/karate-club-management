import { describe, expect, it } from 'vitest';
import { participantResultSchema, previewGradeResult } from './participant-result-schema';

describe('participantResultSchema', () => {
  it('menerima hasil LULUS dengan parameter kyuDecrease valid', () => {
    const valid = {
      result: 'PASSED',
      kyuDecrease: 1,
      toBeltId: 'belt-2',
    };
    expect(participantResultSchema.safeParse(valid).success).toBe(true);
  });

  it('menerima hasil TIDAK LULUS', () => {
    const valid = { result: 'FAILED' };
    expect(participantResultSchema.safeParse(valid).success).toBe(true);
  });

  it('menolak kyuDecrease bukan kelipatan 0.5', () => {
    const invalid = {
      result: 'PASSED',
      kyuDecrease: 1.3,
    };
    const res = participantResultSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('previewGradeResult', () => {
  const whiteBelt = { id: 'b1', name: 'Putih', order: 1, colorHex: '#fff' };
  const yellowBelt = { id: 'b2', name: 'Kuning', order: 2, colorHex: '#ff0' };
  const blackBelt = { id: 'b6', name: 'Hitam', order: 6, colorHex: '#000' };

  it('menghitung penurunan kyu normal (10 turun 1 jadi 9)', () => {
    const preview = previewGradeResult({
      examType: 'KYU',
      fromBelt: whiteBelt,
      fromKyu: 10,
      result: 'PASSED',
      kyuDecrease: 1,
      targetBelt: yellowBelt,
    });
    expect(preview?.kyu).toBe(9);
    expect(preview?.belt.name).toBe('Kuning');
    expect(preview?.dan).toBeNull();
  });

  it('menolak kyu hasil < 0', () => {
    const preview = previewGradeResult({
      examType: 'KYU',
      fromBelt: whiteBelt,
      fromKyu: 0.5,
      result: 'PASSED',
      kyuDecrease: 1,
    });
    expect(preview?.error).toBe('Kyu hasil tidak boleh kurang dari 0');
  });

  it('menghasilkan dan 1 ketika naik ke sabuk hitam', () => {
    const preview = previewGradeResult({
      examType: 'KYU',
      fromBelt: { id: 'b5', name: 'Cokelat', order: 5, colorHex: '#8b4513' },
      fromKyu: 1,
      result: 'PASSED',
      kyuDecrease: 1,
      targetBelt: blackBelt,
    });
    expect(preview?.kyu).toBe(0);
    expect(preview?.dan).toBe(1);
    expect(preview?.error).toBeUndefined();
  });

  it('menghitung kenaikan ujian DAN (dan 1 + 1 = 2)', () => {
    const preview = previewGradeResult({
      examType: 'DAN',
      fromBelt: blackBelt,
      fromKyu: 0,
      fromDan: 1,
      result: 'PASSED',
      danIncrease: 1,
    });
    expect(preview?.dan).toBe(2);
    expect(preview?.kyu).toBe(0);
  });
});

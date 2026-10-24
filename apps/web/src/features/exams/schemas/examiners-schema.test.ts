import { describe, expect, it } from 'vitest';
import { examinersSchema } from './examiners-schema';

describe('examinersSchema', () => {
  it('menerima daftar penguji valid dengan satu ketua', () => {
    const valid = {
      examiners: [
        { name: 'Sensei Tanaka', isChief: true },
        { name: 'Shihan Budi', isChief: false },
      ],
    };
    expect(examinersSchema.safeParse(valid).success).toBe(true);
  });

  it('menerima daftar penguji tanpa ketua', () => {
    const valid = {
      examiners: [{ name: 'Sensei Tanaka', isChief: false }],
    };
    expect(examinersSchema.safeParse(valid).success).toBe(true);
  });

  it('menolak jika lebih dari satu ketua penguji', () => {
    const invalid = {
      examiners: [
        { name: 'Sensei Tanaka', isChief: true },
        { name: 'Shihan Budi', isChief: true },
      ],
    };
    const res = examinersSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('menolak daftar kosong', () => {
    const invalid = { examiners: [] };
    const res = examinersSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

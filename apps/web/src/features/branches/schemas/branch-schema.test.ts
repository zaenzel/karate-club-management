import { describe, expect, it } from 'vitest';
import { branchFormSchema } from './branch-schema';

describe('branchFormSchema', () => {
  it('accepts valid input', () => {
    const result = branchFormSchema.parse({
      code: 'JKT-01',
      name: 'Dojo Jakarta Pusat',
      city: 'Jakarta',
      address: 'Jl. Sudirman No. 1',
      phone: '081234567890',
    });

    expect(result.code).toBe('JKT-01');
    expect(result.name).toBe('Dojo Jakarta Pusat');
  });

  it('accepts empty address and phone', () => {
    const result = branchFormSchema.parse({
      code: 'BDG-01',
      name: 'Dojo Bandung',
      city: 'Bandung',
      address: '',
      phone: '',
    });

    expect(result.code).toBe('BDG-01');
    expect(result.address).toBe('');
    expect(result.phone).toBe('');
  });

  it('rejects short code', () => {
    expect(() =>
      branchFormSchema.parse({
        code: 'J',
        name: 'Dojo Jakarta',
        city: 'Jakarta',
      }),
    ).toThrow('Kode cabang minimal 2 karakter');
  });

  it('rejects invalid code characters', () => {
    expect(() =>
      branchFormSchema.parse({
        code: 'JKT_01',
        name: 'Dojo Jakarta',
        city: 'Jakarta',
      }),
    ).toThrow('Kode cabang hanya boleh huruf, angka, dan tanda hubung (-)');
  });

  it('rejects invalid phone format', () => {
    expect(() =>
      branchFormSchema.parse({
        code: 'JKT-01',
        name: 'Dojo Jakarta',
        city: 'Jakarta',
        phone: '08123abc',
      }),
    ).toThrow('Nomor telepon hanya boleh angka, spasi, +, dan -');
  });
});

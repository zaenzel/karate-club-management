import { describe, expect, it } from 'vitest';

import { memberCreateSchema, memberUpdateSchema } from './member-schema';

describe('memberCreateSchema', () => {
  it('validasi lolos untuk member baru tanpa initial grade', () => {
    const result = memberCreateSchema.safeParse({
      type: 'STUDENT',
      name: 'Budi Santoso',
      birthPlace: 'Bandung',
      birthDate: '2012-05-01',
      address: 'Jl. Melati No. 5',
      phone: '08123456789',
      branchId: 'b-1',
      hasInitialGrade: false,
    });

    expect(result.success).toBe(true);
  });

  it('validasi lolos untuk member lama dengan tingkatan awal biru kyu 5', () => {
    const result = memberCreateSchema.safeParse({
      type: 'STUDENT',
      name: 'Andi',
      birthPlace: 'Jakarta',
      birthDate: '2010-01-01',
      address: 'Jl. Sudirman',
      branchId: 'b-1',
      hasInitialGrade: true,
      initialBeltId: 'belt-blue',
      initialBeltOrder: 4,
      initialKyu: 5,
    });

    expect(result.success).toBe(true);
  });

  it('menolak sabuk hitam bila kyu bukan 0', () => {
    const result = memberCreateSchema.safeParse({
      type: 'COACH',
      name: 'Sensei Ali',
      birthPlace: 'Surabaya',
      birthDate: '1988-01-01',
      address: 'Jl. Pemuda',
      branchId: 'b-1',
      hasInitialGrade: true,
      initialBeltId: 'belt-black',
      initialBeltOrder: 6,
      initialKyu: 1,
      initialDan: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.issues.map((i) => i.message);
      expect(errorMsg).toContain('Sabuk hitam hanya diperbolehkan bila kyu bernilai 0');
    }
  });

  it('menolak sabuk selain hitam jika diisi tingkatan dan', () => {
    const result = memberCreateSchema.safeParse({
      type: 'STUDENT',
      name: 'Citra',
      birthPlace: 'Bandung',
      birthDate: '2012-01-01',
      address: 'Jl. Riau',
      branchId: 'b-1',
      hasInitialGrade: true,
      initialBeltId: 'belt-blue',
      initialBeltOrder: 4,
      initialKyu: 5,
      initialDan: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.issues.map((i) => i.message);
      expect(errorMsg).toContain('Tingkatan dan hanya berlaku untuk sabuk hitam');
    }
  });

  it('menolak tanggal lahir di masa depan', () => {
    const result = memberCreateSchema.safeParse({
      type: 'STUDENT',
      name: 'Budi',
      birthPlace: 'Bandung',
      birthDate: '2099-01-01',
      address: 'Jl. Riau',
      branchId: 'b-1',
      hasInitialGrade: false,
    });

    expect(result.success).toBe(false);
  });
});

describe('memberUpdateSchema', () => {
  it('validasi lolos untuk update data diri saja', () => {
    const result = memberUpdateSchema.safeParse({
      type: 'COACH',
      name: 'Sensei Budi Updated',
      birthPlace: 'Bandung',
      birthDate: '1990-05-01',
      address: 'Jl. Dago No. 12',
      branchId: 'b-2',
    });

    expect(result.success).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { createBranchSchema } from './create-branch.dto.js';
import { listBranchesSchema } from './list-branches.query.js';

describe('createBranchSchema', () => {
  it('normalizes code to uppercase and trims fields', () => {
    const result = createBranchSchema.parse({
      code: '  jkt-01  ',
      name: '  Dojo Senayan  ',
      city: '  Jakarta Pusat  ',
    });

    expect(result.code).toBe('JKT-01');
    expect(result.name).toBe('Dojo Senayan');
    expect(result.city).toBe('Jakarta Pusat');
    expect(result.address).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.headCoachId).toBeNull();
  });

  it('converts empty string fields to null', () => {
    const result = createBranchSchema.parse({
      code: 'BDG-01',
      name: 'Dojo Dago',
      city: 'Bandung',
      address: '   ',
      phone: '',
      headCoachId: '',
    });

    expect(result.address).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.headCoachId).toBeNull();
  });

  it('accepts valid phone numbers', () => {
    const result = createBranchSchema.parse({
      code: 'SBY-01',
      name: 'Dojo Gubeng',
      city: 'Surabaya',
      phone: '+62 812-3456-7890',
    });

    expect(result.phone).toBe('+62 812-3456-7890');
  });

  it('rejects invalid phone numbers with letters', () => {
    expect(() =>
      createBranchSchema.parse({
        code: 'SBY-01',
        name: 'Dojo Gubeng',
        city: 'Surabaya',
        phone: '08123-abc',
      }),
    ).toThrow();
  });

  it('rejects invalid code characters', () => {
    expect(() =>
      createBranchSchema.parse({
        code: 'JKT_01',
        name: 'Dojo Senayan',
        city: 'Jakarta',
      }),
    ).toThrow();
  });

  it('rejects short code', () => {
    expect(() =>
      createBranchSchema.parse({
        code: 'J',
        name: 'Dojo Senayan',
        city: 'Jakarta',
      }),
    ).toThrow();
  });

  it('rejects invalid headCoachId that is not UUID', () => {
    expect(() =>
      createBranchSchema.parse({
        code: 'JKT-01',
        name: 'Dojo Senayan',
        city: 'Jakarta',
        headCoachId: 'not-a-uuid',
      }),
    ).toThrow();
  });

  it('accepts valid UUID headCoachId', () => {
    const validUuid = '01912f2c-e3f4-7f89-87a1-2b6b0c2e3a1f';
    const result = createBranchSchema.parse({
      code: 'JKT-01',
      name: 'Dojo Senayan',
      city: 'Jakarta',
      headCoachId: validUuid,
    });

    expect(result.headCoachId).toBe(validUuid);
  });
});

describe('listBranchesSchema', () => {
  it('applies default pagination values', () => {
    const result = listBranchesSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.q).toBeUndefined();
  });

  it('parses q and pagination numbers', () => {
    const result = listBranchesSchema.parse({ page: '2', pageSize: '10', q: 'jakarta' });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(result.q).toBe('jakarta');
  });
});

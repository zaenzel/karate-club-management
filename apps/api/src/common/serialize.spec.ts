import { toDateOnly, toNumber } from './serialize.js';

describe('toNumber', () => {
  it('mengubah Decimal menjadi number', () => {
    expect(toNumber({ toNumber: () => 9.5 })).toBe(9.5);
  });
});

describe('toDateOnly', () => {
  it('memformat YYYY-MM-DD', () => {
    expect(toDateOnly(new Date('2026-03-31T00:00:00.000Z'))).toBe('2026-03-31');
  });

  it('aman di 1 Januari dan 31 Desember', () => {
    expect(toDateOnly(new Date('2026-01-01T00:00:00.000Z'))).toBe('2026-01-01');
    expect(toDateOnly(new Date('2026-12-31T00:00:00.000Z'))).toBe('2026-12-31');
  });
});

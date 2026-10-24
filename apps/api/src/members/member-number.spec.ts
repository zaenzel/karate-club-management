import { describe, expect, it, vi } from 'vitest';

import {
  formatMemberNumber,
  getNextMemberNumber,
  parseMemberNumberSequence,
} from './member-number.js';

describe('formatMemberNumber', () => {
  it('memformat tahun dan nomor urut 5 digit', () => {
    expect(formatMemberNumber(2026, 1)).toBe('M202600001');
    expect(formatMemberNumber(2026, 42)).toBe('M202600042');
    expect(formatMemberNumber(2027, 99999)).toBe('M202799999');
  });
});

describe('parseMemberNumberSequence', () => {
  it('mengekstrak nomor urut jika tahun cocok', () => {
    expect(parseMemberNumberSequence('M202600001', 2026)).toBe(1);
    expect(parseMemberNumberSequence('M202600123', 2026)).toBe(123);
  });

  it('mengembalikan null jika tahun tidak cocok atau format salah', () => {
    expect(parseMemberNumberSequence('M202500001', 2026)).toBeNull();
    expect(parseMemberNumberSequence('X202600001', 2026)).toBeNull();
  });
});

describe('getNextMemberNumber', () => {
  it('menghasilkan nomor pertama jika belum ada member di tahun tersebut', async () => {
    const client = {
      member: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    const next = await getNextMemberNumber(client as any, new Date('2026-03-15'));
    expect(next).toBe('M202600001');
    expect(client.member.findFirst).toHaveBeenCalledWith({
      where: { memberNumber: { startsWith: 'M2026' } },
      orderBy: { memberNumber: 'desc' },
      select: { memberNumber: true },
    });
  });

  it('melanjutkan nomor berikutnya jika sudah ada member', async () => {
    const client = {
      member: {
        findFirst: vi.fn().mockResolvedValue({ memberNumber: 'M202600008' }),
      },
    };

    const next = await getNextMemberNumber(client as any, new Date('2026-07-20'));
    expect(next).toBe('M202600009');
  });

  it('mereset nomor urut saat pergantian tahun', async () => {
    const client = {
      member: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    const next = await getNextMemberNumber(client as any, new Date('2027-01-01'));
    expect(next).toBe('M202700001');
  });
});

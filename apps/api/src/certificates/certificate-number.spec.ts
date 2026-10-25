import { describe, it, expect, vi } from 'vitest';
import {
  formatCertificateNumber,
  parseCertificateNumberSequence,
  getNextCertificateNumber,
} from './certificate-number.js';

describe('certificate-number', () => {
  it('formatCertificateNumber memformat dengan prefix C, tahun, dan padding 5 digit', () => {
    expect(formatCertificateNumber(2026, 1)).toBe('C202600001');
    expect(formatCertificateNumber(2026, 42)).toBe('C202600042');
    expect(formatCertificateNumber(2026, 99999)).toBe('C202699999');
  });

  it('parseCertificateNumberSequence mengekstrak urutan angka dengan benar', () => {
    expect(parseCertificateNumberSequence('C202600001', 2026)).toBe(1);
    expect(parseCertificateNumberSequence('C202600123', 2026)).toBe(123);
    expect(parseCertificateNumberSequence('C202500001', 2026)).toBeNull();
    expect(parseCertificateNumberSequence('M202600001', 2026)).toBeNull();
  });

  it('getNextCertificateNumber mulai dari 1 bila belum ada sertifikat di tahun tersebut', async () => {
    const mockClient = {
      certificate: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    const date = new Date('2026-05-15T00:00:00Z');
    const num = await getNextCertificateNumber(mockClient, date);
    expect(num).toBe('C202600001');
  });

  it('getNextCertificateNumber menambah 1 dari urutan sertifikat terakhir', async () => {
    const mockClient = {
      certificate: {
        findFirst: vi.fn().mockResolvedValue({ number: 'C202600015' }),
      },
    };

    const date = new Date('2026-05-15T00:00:00Z');
    const num = await getNextCertificateNumber(mockClient, date);
    expect(num).toBe('C202600016');
  });
});

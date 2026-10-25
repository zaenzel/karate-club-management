import { describe, it, expect } from 'vitest';
import {
  formatDateId,
  formatGradeText,
  mapCertificateToTexts,
  type RawCertificateRecord,
} from './certificate-data.js';

describe('certificate-data', () => {
  it('formatDateId memformat tanggal ke bahasa Indonesia dengan benar', () => {
    const d1 = new Date('2026-03-31T00:00:00Z');
    expect(formatDateId(d1)).toBe('31 Maret 2026');

    const d2 = new Date('2026-10-18T00:00:00Z');
    expect(formatDateId(d2)).toBe('18 Oktober 2026');
  });

  it('formatGradeText memformat tingkatan sabuk kyu sesuai A14', () => {
    expect(formatGradeText('Kuning', 9, null)).toBe('kuning kyu 9');
    expect(formatGradeText('Hijau', 7.5, null)).toBe('hijau kyu 7.5');
    expect(formatGradeText('Cokelat', 1, null)).toBe('cokelat kyu 1');
  });

  it('formatGradeText memformat tingkatan sabuk hitam dan sesuai A14', () => {
    expect(formatGradeText('Hitam', 0, 1)).toBe('hitam dan 1');
    expect(formatGradeText('Hitam', 0, 2)).toBe('hitam dan 2');
  });

  it('mapCertificateToTexts memetakan data relasional ke teks isian sertifikat', () => {
    const raw: RawCertificateRecord = {
      id: 'cert-1',
      number: 'C202600001',
      member: {
        name: 'Budi Santoso',
        birthPlace: 'Jakarta',
        birthDate: new Date('2012-05-12T00:00:00Z'),
        branch: {
          name: 'Dojo Senayan',
        },
      },
      examParticipant: {
        exam: {
          date: new Date('2026-10-24T00:00:00Z'),
          location: 'Gedung Olahraga Jakarta',
        },
        gradeHistory: {
          toBelt: {
            name: 'Kuning',
          },
          toKyu: 9,
          toDan: null,
        },
      },
    };

    const texts = mapCertificateToTexts(raw);

    expect(texts.number).toBe('C202600001');
    expect(texts.name).toBe('Budi Santoso');
    expect(texts.birth).toBe('Jakarta, 12 Mei 2012');
    expect(texts.branch).toBe('Dojo Senayan');
    expect(texts.examDate).toBe('24 Oktober 2026');
    expect(texts.examLocation).toBe('Gedung Olahraga Jakarta');
    expect(texts.grade).toBe('kuning kyu 9');
  });
});

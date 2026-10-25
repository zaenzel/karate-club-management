import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { renderCertificatePdf } from './pdf-renderer.js';

describe('pdf-renderer', () => {
  it('merender PDF vektor dengan teks yang disematkan dan metadata nomor', async () => {
    // Buat dummy design PDF (A4 Lanskap 842 x 595 pt)
    const baseDoc = await PDFDocument.create();
    baseDoc.addPage([841.89, 595.28]);
    const designPdfBuffer = Buffer.from(await baseDoc.save());

    const texts = {
      number: 'C202600001',
      name: 'Budi Santoso',
      birth: 'Jakarta, 12 Mei 2012',
      branch: 'Dojo Senayan',
      examDate: '24 Oktober 2026',
      examLocation: 'Dojo Pusat',
      grade: 'kuning kyu 9',
    };

    const renderedBuffer = await renderCertificatePdf({
      designPdfBuffer,
      texts,
    });

    expect(renderedBuffer).toBeInstanceOf(Buffer);
    expect(renderedBuffer.length).toBeGreaterThan(100);

    // Muat ulang PDF hasil render untuk verifikasi metadata dan dimensi
    const doc = await PDFDocument.load(renderedBuffer);
    expect(doc.getTitle()).toBe('Sertifikat C202600001');
    expect(doc.getPageCount()).toBe(1);

    const page = doc.getPage(0);
    const { width, height } = page.getSize();
    expect(Math.round(width)).toBe(842);
    expect(Math.round(height)).toBe(595);
  });
});

import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { validateDesignPdf, validateSignaturePng } from './file-validator.js';

describe('file-validator', () => {
  describe('validateDesignPdf', () => {
    it('menerima PDF A4 potret valid', async () => {
      const doc = await PDFDocument.create();
      doc.addPage([595.28, 841.89]);
      const pdfBytes = await doc.save();
      const buffer = Buffer.from(pdfBytes);

      await expect(validateDesignPdf(buffer)).resolves.toBeUndefined();
    });

    it('menerima PDF A4 lanskap valid', async () => {
      const doc = await PDFDocument.create();
      doc.addPage([841.89, 595.28]);
      const pdfBytes = await doc.save();
      const buffer = Buffer.from(pdfBytes);

      await expect(validateDesignPdf(buffer)).resolves.toBeUndefined();
    });

    it('menolak file bukan PDF (magic bytes salah)', async () => {
      const buffer = Buffer.from('NOT_A_PDF_CONTENT');
      await expect(validateDesignPdf(buffer)).rejects.toThrow(BadRequestException);
    });

    it('menolak PDF dengan ukuran bukan A4 (misal persegi 300x300)', async () => {
      const doc = await PDFDocument.create();
      doc.addPage([300, 300]);
      const pdfBytes = await doc.save();
      const buffer = Buffer.from(pdfBytes);

      await expect(validateDesignPdf(buffer)).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateSignaturePng', () => {
    it('menerima file dengan header PNG valid', () => {
      const validPngHeader = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
      ]);
      expect(() => validateSignaturePng(validPngHeader)).not.toThrow();
    });

    it('menolak file gambar non-PNG', () => {
      const invalidHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]); // JPEG
      expect(() => validateSignaturePng(invalidHeader)).toThrow(BadRequestException);
    });

    it('menolak file kurang dari 8 bytes', () => {
      const tooShort = Buffer.from([0x89, 0x50]);
      expect(() => validateSignaturePng(tooShort)).toThrow(BadRequestException);
    });
  });
});

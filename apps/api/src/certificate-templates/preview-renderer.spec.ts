import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { renderPdfToPreviewPng } from './preview-renderer.js';

describe('preview-renderer', () => {
  it('merasterisasi halaman pertama PDF ke PNG preview', async () => {
    const baseDoc = await PDFDocument.create();
    baseDoc.addPage([841.89, 595.28]);
    const pdfBuffer = Buffer.from(await baseDoc.save());

    const pngBuffer = await renderPdfToPreviewPng(pdfBuffer);

    expect(pngBuffer).toBeInstanceOf(Buffer);
    expect(pngBuffer.length).toBeGreaterThan(100);

    // Verifikasi magic bytes PNG (89 50 4E 47)
    expect(pngBuffer[0]).toBe(0x89);
    expect(pngBuffer[1]).toBe(0x50);
    expect(pngBuffer[2]).toBe(0x4e);
    expect(pngBuffer[3]).toBe(0x47);
  });
});

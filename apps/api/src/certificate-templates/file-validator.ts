import { BadRequestException } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

export async function validateDesignPdf(buffer: Buffer): Promise<void> {
  // 1. Cek magic bytes %PDF-
  if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new BadRequestException('File desain harus berupa dokumen PDF yang valid');
  }

  // 2. Muat dengan pdf-lib dan periksa dimensi halaman pertama
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(buffer, { ignoreEncryption: false });
  } catch {
    throw new BadRequestException('File desain PDF rusak atau terenkripsi');
  }

  if (doc.getPageCount() === 0) {
    throw new BadRequestException('File desain PDF tidak memiliki halaman');
  }

  const firstPage = doc.getPage(0);
  const { width, height } = firstPage.getSize();

  // A4 standar: 595.28 x 841.89 pt. Toleransi ± 2 pt (potret atau lanskap)
  const isPortraitA4 = Math.abs(width - 595.28) <= 2 && Math.abs(height - 841.89) <= 2;
  const isLandscapeA4 = Math.abs(width - 841.89) <= 2 && Math.abs(height - 595.28) <= 2;

  // Toleransi juga untuk pembulatan integer 595 x 842 pt
  const isPortraitA4Int = Math.abs(width - 595) <= 2 && Math.abs(height - 842) <= 2;
  const isLandscapeA4Int = Math.abs(width - 842) <= 2 && Math.abs(height - 595) <= 2;

  if (!isPortraitA4 && !isLandscapeA4 && !isPortraitA4Int && !isLandscapeA4Int) {
    throw new BadRequestException(
      `Halaman pertama PDF harus berukuran A4 (595 × 842 pt ± 2 pt). Ukuran saat ini: ${Math.round(width)} × ${Math.round(height)} pt`,
    );
  }
}

export function validateSignaturePng(buffer: Buffer): void {
  // Magic bytes PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngHeader = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length < 8) {
    throw new BadRequestException('File tanda tangan harus berupa gambar PNG yang valid');
  }

  for (let i = 0; i < pngHeader.length; i++) {
    if (buffer[i] !== pngHeader[i]) {
      throw new BadRequestException('File tanda tangan harus berupa gambar PNG yang valid');
    }
  }
}

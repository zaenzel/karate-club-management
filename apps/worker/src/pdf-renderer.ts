import { readFileSync, existsSync } from 'node:fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { CertificateTextValues } from './certificate-data.js';

export interface FieldCoord {
  x: number;
  y: number;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number;
}

export interface FieldLayout {
  name?: FieldCoord;
  birth?: FieldCoord;
  branch?: FieldCoord;
  examDate?: FieldCoord;
  examLocation?: FieldCoord;
  grade?: FieldCoord;
  number?: FieldCoord;
  signature?: { x: number; y: number; width?: number; height?: number };
}

// Default field layout untuk A4 Lanskap (842 x 595 pt)
export const DEFAULT_FIELD_LAYOUT: FieldLayout = {
  name: { x: 266, y: 391.5, fontSize: 14, align: 'left', maxWidth: 350 },
  birth: { x: 266, y: 359, fontSize: 13, align: 'left', maxWidth: 350 },
  branch: { x: 266, y: 294, fontSize: 13, align: 'left', maxWidth: 350 },
  examDate: { x: 608, y: 252, fontSize: 13, align: 'left', maxWidth: 200 },
  examLocation: { x: 198, y: 227, fontSize: 13, align: 'left', maxWidth: 200 },
  grade: { x: 642, y: 227, fontSize: 13, align: 'left', maxWidth: 200 },
  number: { x: 421, y: 460, fontSize: 12, align: 'center' },
  signature: { x: 630, y: 95, width: 120, height: 60 },
};

export async function renderCertificatePdf(options: {
  designPdfBuffer: Buffer;
  texts: CertificateTextValues;
  fieldLayout?: FieldLayout | null;
  signaturePngBuffer?: Buffer | null;
  fontPath?: string;
}): Promise<Buffer> {
  const { designPdfBuffer, texts, signaturePngBuffer, fontPath } = options;
  const layout: FieldLayout = {
    ...DEFAULT_FIELD_LAYOUT,
    ...options.fieldLayout,
  };

  const doc = await PDFDocument.load(designPdfBuffer);
  doc.registerFontkit(fontkit);

  // Muat font serif: gunakan DejaVuSerif bila tersedia, fallback ke TimesRoman
  let font: any;
  if (fontPath && existsSync(fontPath)) {
    const fontBytes = readFileSync(fontPath);
    font = await doc.embedFont(fontBytes);
  } else {
    font = await doc.embedFont(StandardFonts.TimesRoman);
  }

  const page = doc.getPage(0);

  function drawField(text: string, coord?: FieldCoord, defaultCoord?: FieldCoord) {
    if (!text || (!coord && !defaultCoord)) return;
    const cfg = { ...defaultCoord, ...coord };
    if (cfg.x === undefined || cfg.y === undefined) return;

    let fontSize = cfg.fontSize ?? 14;
    const maxWidth = cfg.maxWidth;

    if (maxWidth) {
      let textWidth = font.widthOfTextAtSize(text, fontSize);
      while (textWidth > maxWidth && fontSize > 8) {
        fontSize -= 0.5;
        textWidth = font.widthOfTextAtSize(text, fontSize);
      }
    }

    const finalWidth = font.widthOfTextAtSize(text, fontSize);
    let drawX = cfg.x;
    if (cfg.align === 'center') {
      drawX = cfg.x - finalWidth / 2;
    } else if (cfg.align === 'right') {
      drawX = cfg.x - finalWidth;
    }

    page.drawText(text, {
      x: drawX,
      y: cfg.y,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  // Tulis field teks
  drawField(texts.name, layout.name, DEFAULT_FIELD_LAYOUT.name);
  drawField(texts.birth, layout.birth, DEFAULT_FIELD_LAYOUT.birth);
  drawField(texts.branch, layout.branch, DEFAULT_FIELD_LAYOUT.branch);
  drawField(texts.examDate, layout.examDate, DEFAULT_FIELD_LAYOUT.examDate);
  drawField(texts.examLocation, layout.examLocation, DEFAULT_FIELD_LAYOUT.examLocation);
  drawField(texts.grade, layout.grade, DEFAULT_FIELD_LAYOUT.grade);
  drawField(texts.number, layout.number, DEFAULT_FIELD_LAYOUT.number);

  // Tempel gambar tanda tangan jika ada
  if (signaturePngBuffer && layout.signature) {
    const pngImage = await doc.embedPng(signaturePngBuffer);
    const targetWidth = layout.signature.width ?? 120;
    const scale = targetWidth / pngImage.width;
    const targetHeight = layout.signature.height ?? pngImage.height * scale;

    page.drawImage(pngImage, {
      x: layout.signature.x,
      y: layout.signature.y,
      width: targetWidth,
      height: targetHeight,
    });
  }

  // Set metadata PDF
  doc.setTitle(`Sertifikat ${texts.number}`);
  doc.setProducer('Karate Club Management');

  const savedBytes = await doc.save();
  return Buffer.from(savedBytes);
}

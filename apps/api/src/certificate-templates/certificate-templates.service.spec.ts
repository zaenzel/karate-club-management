import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { CertificateTemplatesService, type UploadedFile } from './certificate-templates.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { StorageService } from '../storage/storage.service.js';
import type { AuditService } from '../audit/audit.service.js';

describe('CertificateTemplatesService', () => {
  let service: CertificateTemplatesService;
  let mockPrisma: any;
  let mockStorage: any;
  let mockAudit: any;
  let validPdfBuffer: Buffer;
  let _validPngBuffer: Buffer;

  beforeEach(async () => {
    // Generate minimal A4 PDF
    const doc = await PDFDocument.create();
    doc.addPage([841.89, 595.28]); // A4 landscape
    const pdfBytes = await doc.save();
    validPdfBuffer = Buffer.from(pdfBytes);

    // Minimal PNG header
    _validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

    mockPrisma = {
      client: {
        certificateTemplate: {
          count: vi.fn(),
          create: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          update: vi.fn(),
          updateMany: vi.fn(),
          delete: vi.fn().mockResolvedValue(undefined),
        },
        certificate: {
          count: vi.fn(),
        },
        $transaction: vi.fn(async (cb) => cb(mockPrisma.client)),
      },
    };

    mockStorage = {
      putObject: vi.fn().mockResolvedValue(undefined),
      getPresignedDownloadUrl: vi.fn().mockResolvedValue('http://localhost:9000/presigned-url'),
      exists: vi.fn().mockResolvedValue(true),
      getObject: vi.fn().mockResolvedValue(validPdfBuffer),
    };

    mockAudit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    service = new CertificateTemplatesService(
      mockPrisma as unknown as PrismaService,
      mockStorage as unknown as StorageService,
      mockAudit as unknown as AuditService,
    );
  });

  describe('create', () => {
    it('template pertama yang dibuat otomatis aktif', async () => {
      mockPrisma.client.certificateTemplate.count.mockResolvedValueOnce(0);
      mockPrisma.client.certificateTemplate.create.mockResolvedValueOnce({
        id: 'tmpl-1',
        name: 'Template 2026',
        signerName: 'Ketua Sensei',
        signerTitle: 'Ketua',
        paperSize: 'A4',
        fieldLayout: null,
        isActive: true,
        fileKey: 'pending',
        signatureKey: null,
      });
      mockPrisma.client.certificateTemplate.update.mockResolvedValueOnce({
        id: 'tmpl-1',
        name: 'Template 2026',
        signerName: 'Ketua Sensei',
        signerTitle: 'Ketua',
        paperSize: 'A4',
        fieldLayout: null,
        isActive: true,
        fileKey: 'templates/tmpl-1/design.pdf',
        signatureKey: null,
        createdAt: new Date(),
        _count: { certificates: 0 },
      });

      const designFile: UploadedFile = {
        buffer: validPdfBuffer,
        originalname: 'design.pdf',
        mimetype: 'application/pdf',
        size: validPdfBuffer.length,
      };

      const result = await service.create(
        {
          name: 'Template 2026',
          signerName: 'Ketua Sensei',
          signerTitle: 'Ketua',
          paperSize: 'A4',
        },
        designFile,
      );

      expect(result.isActive).toBe(true);
      expect(mockStorage.putObject).toHaveBeenCalledWith(
        'templates/tmpl-1/design.pdf',
        validPdfBuffer,
        'application/pdf',
      );
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'certificate_template.create', entityId: 'tmpl-1' }),
      );
    });

    it('template berikutnya tidak otomatis aktif', async () => {
      mockPrisma.client.certificateTemplate.count.mockResolvedValueOnce(1);
      mockPrisma.client.certificateTemplate.create.mockResolvedValueOnce({
        id: 'tmpl-2',
        name: 'Template Kedua',
        signerName: 'Ketua Sensei',
        signerTitle: 'Ketua',
        paperSize: 'A4',
        fieldLayout: null,
        isActive: false,
        fileKey: 'pending',
        signatureKey: null,
      });
      mockPrisma.client.certificateTemplate.update.mockResolvedValueOnce({
        id: 'tmpl-2',
        name: 'Template Kedua',
        signerName: 'Ketua Sensei',
        signerTitle: 'Ketua',
        paperSize: 'A4',
        fieldLayout: null,
        isActive: false,
        fileKey: 'templates/tmpl-2/design.pdf',
        signatureKey: null,
        createdAt: new Date(),
        _count: { certificates: 0 },
      });

      const designFile: UploadedFile = {
        buffer: validPdfBuffer,
        originalname: 'design.pdf',
        mimetype: 'application/pdf',
        size: validPdfBuffer.length,
      };

      const result = await service.create(
        {
          name: 'Template Kedua',
          signerName: 'Ketua Sensei',
          signerTitle: 'Ketua',
          paperSize: 'A4',
        },
        designFile,
      );

      expect(result.isActive).toBe(false);
    });

    it('menghapus baris template (kompensasi) jika upload storage gagal', async () => {
      mockPrisma.client.certificateTemplate.count.mockResolvedValueOnce(0);
      mockPrisma.client.certificateTemplate.create.mockResolvedValueOnce({
        id: 'tmpl-fail',
        name: 'Gagal Upload',
      });
      mockStorage.putObject.mockRejectedValueOnce(new Error('S3 error'));

      const designFile: UploadedFile = {
        buffer: validPdfBuffer,
        originalname: 'design.pdf',
        mimetype: 'application/pdf',
        size: validPdfBuffer.length,
      };

      await expect(
        service.create(
          { name: 'Gagal Upload', signerName: 'Sensei', signerTitle: 'Ketua', paperSize: 'A4' },
          designFile,
        ),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockPrisma.client.certificateTemplate.delete).toHaveBeenCalledWith({
        where: { id: 'tmpl-fail' },
      });
    });
  });

  describe('update', () => {
    it('menolak ganti file bila template sudah pernah dipakai oleh sertifikat', async () => {
      mockPrisma.client.certificateTemplate.findUnique.mockResolvedValueOnce({
        id: 'tmpl-used',
        name: 'Sudah Dipakai',
        _count: { certificates: 5 },
      });

      const designFile: UploadedFile = {
        buffer: validPdfBuffer,
        originalname: 'design.pdf',
        mimetype: 'application/pdf',
        size: validPdfBuffer.length,
      };

      await expect(service.update('tmpl-used', {}, designFile)).rejects.toThrow(ConflictException);
    });
  });

  describe('activate', () => {
    it('menonaktifkan semua template lain dan mengaktifkan yang dipilih', async () => {
      mockPrisma.client.certificateTemplate.findUnique
        .mockResolvedValueOnce({ id: 'tmpl-2', isActive: false })
        .mockResolvedValueOnce({
          id: 'tmpl-2',
          name: 'Template 2',
          signerName: 'Sensei',
          signerTitle: 'Ketua',
          paperSize: 'A4',
          fieldLayout: null,
          isActive: true,
          signatureKey: null,
          createdAt: new Date(),
          _count: { certificates: 0 },
        });

      const result = await service.activate('tmpl-2');

      expect(mockPrisma.client.certificateTemplate.updateMany).toHaveBeenCalledWith({
        data: { isActive: false },
      });
      expect(mockPrisma.client.certificateTemplate.update).toHaveBeenCalledWith({
        where: { id: 'tmpl-2' },
        data: { isActive: true },
      });
      expect(result.isActive).toBe(true);
    });
  });

  describe('getPreviewUrl', () => {
    it('mengembalikan presigned url preview jika sudah ada di storage', async () => {
      mockPrisma.client.certificateTemplate.findUnique.mockResolvedValue({
        id: 'tmpl-1',
        name: 'Template 1',
        fileKey: 'templates/tmpl-1/design.pdf',
      });
      mockStorage.exists.mockResolvedValue(true);

      const url = await service.getPreviewUrl('tmpl-1');

      expect(url).toBe('http://localhost:9000/presigned-url');
      expect(mockStorage.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'templates/tmpl-1/preview.png',
        expect.any(Object),
      );
    });
  });
});

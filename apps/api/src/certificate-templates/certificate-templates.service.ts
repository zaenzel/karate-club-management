import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@karate/db';
import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import type { CreateTemplateDto } from './dto/create-template.dto.js';
import type { UpdateTemplateDto } from './dto/update-template.dto.js';
import { validateDesignPdf, validateSignaturePng } from './file-validator.js';
import { renderPdfToPreviewPng } from './preview-renderer.js';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface CertificateTemplateResponse {
  id: string;
  name: string;
  signerName: string;
  signerTitle: string;
  paperSize: string;
  fieldLayout: any;
  isActive: boolean;
  hasSignature: boolean;
  createdAt: Date;
  certificatesCount: number;
}

@Injectable()
export class CertificateTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  async list(): Promise<CertificateTemplateResponse[]> {
    const templates = await this.prisma.client.certificateTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { certificates: true },
        },
      },
    });

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      signerName: t.signerName,
      signerTitle: t.signerTitle,
      paperSize: t.paperSize,
      fieldLayout: t.fieldLayout,
      isActive: t.isActive,
      hasSignature: Boolean(t.signatureKey),
      createdAt: t.createdAt,
      certificatesCount: t._count.certificates,
    }));
  }

  async findById(id: string): Promise<CertificateTemplateResponse> {
    const template = await this.prisma.client.certificateTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { certificates: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template sertifikat tidak ditemukan');
    }

    return {
      id: template.id,
      name: template.name,
      signerName: template.signerName,
      signerTitle: template.signerTitle,
      paperSize: template.paperSize,
      fieldLayout: template.fieldLayout,
      isActive: template.isActive,
      hasSignature: Boolean(template.signatureKey),
      createdAt: template.createdAt,
      certificatesCount: template._count.certificates,
    };
  }

  async create(
    dto: CreateTemplateDto,
    designFile?: UploadedFile,
    signatureFile?: UploadedFile,
    user?: AuthenticatedUser,
  ): Promise<CertificateTemplateResponse> {
    if (!designFile) {
      throw new BadRequestException('File desain PDF wajib diunggah');
    }

    // 1. Validasi isi file
    await validateDesignPdf(designFile.buffer);
    if (signatureFile) {
      validateSignaturePng(signatureFile.buffer);
    }

    // 2. Tentukan isActive: otomatis aktif jika belum ada template sama sekali
    const count = await this.prisma.client.certificateTemplate.count();
    const isActive = count === 0;

    // 3. Buat baris di database terlebih dahulu untuk mendapatkan ID unik
    const template = await this.prisma.client.certificateTemplate.create({
      data: {
        name: dto.name,
        fileKey: 'pending',
        signerName: dto.signerName,
        signerTitle: dto.signerTitle,
        paperSize: dto.paperSize,
        fieldLayout: dto.fieldLayout ?? Prisma.JsonNull,
        isActive,
      },
    });

    const fileKey = `templates/${template.id}/design.pdf`;
    const signatureKey = signatureFile ? `templates/${template.id}/signature.png` : null;

    try {
      // 4. Upload ke MinIO/S3
      await this.storage.putObject(fileKey, designFile.buffer, 'application/pdf');
      if (signatureFile && signatureKey) {
        await this.storage.putObject(signatureKey, signatureFile.buffer, 'image/png');
      }

      // 5. Perbarui baris dengan key file
      const updated = await this.prisma.client.certificateTemplate.update({
        where: { id: template.id },
        data: {
          fileKey,
          signatureKey,
        },
        include: {
          _count: {
            select: { certificates: true },
          },
        },
      });

      await this.audit.log({
        userId: user?.id,
        action: 'certificate_template.create',
        entity: 'CertificateTemplate',
        entityId: template.id,
        after: {
          name: updated.name,
          signerName: updated.signerName,
          isActive: updated.isActive,
          fileKey,
          signatureKey,
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        signerName: updated.signerName,
        signerTitle: updated.signerTitle,
        paperSize: updated.paperSize,
        fieldLayout: updated.fieldLayout,
        isActive: updated.isActive,
        hasSignature: Boolean(updated.signatureKey),
        createdAt: updated.createdAt,
        certificatesCount: updated._count.certificates,
      };
    } catch (err) {
      // Kompensasi: hapus record database bila upload gagal agar tidak ada data yatim
      await this.prisma.client.certificateTemplate
        .delete({ where: { id: template.id } })
        .catch(() => {});
      throw new InternalServerErrorException(
        `Gagal menyimpan file template ke storage: ${err instanceof Error ? err.message : 'Error tidak diketahui'}`,
      );
    }
  }

  async update(
    id: string,
    dto: UpdateTemplateDto,
    designFile?: UploadedFile,
    signatureFile?: UploadedFile,
    user?: AuthenticatedUser,
  ): Promise<CertificateTemplateResponse> {
    const existing = await this.prisma.client.certificateTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { certificates: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Template sertifikat tidak ditemukan');
    }

    // Jika ingin mengganti file, pastikan template belum dipakai oleh sertifikat mana pun
    if (designFile || signatureFile) {
      if (existing._count.certificates > 0) {
        throw new ConflictException(
          'File template yang sudah dipakai oleh sertifikat tidak boleh diganti. Buat template baru.',
        );
      }
    }

    let fileKey = existing.fileKey;
    let signatureKey = existing.signatureKey;

    if (designFile) {
      await validateDesignPdf(designFile.buffer);
      fileKey = `templates/${id}/design.pdf`;
      await this.storage.putObject(fileKey, designFile.buffer, 'application/pdf');
    }

    if (signatureFile) {
      validateSignaturePng(signatureFile.buffer);
      signatureKey = `templates/${id}/signature.png`;
      await this.storage.putObject(signatureKey, signatureFile.buffer, 'image/png');
    }

    const updated = await this.prisma.client.certificateTemplate.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        signerName: dto.signerName ?? existing.signerName,
        signerTitle: dto.signerTitle ?? existing.signerTitle,
        fieldLayout:
          dto.fieldLayout !== undefined
            ? (dto.fieldLayout ?? Prisma.JsonNull)
            : (existing.fieldLayout ?? Prisma.JsonNull),
        fileKey,
        signatureKey,
      },
      include: {
        _count: {
          select: { certificates: true },
        },
      },
    });

    await this.audit.log({
      userId: user?.id,
      action: 'certificate_template.update',
      entity: 'CertificateTemplate',
      entityId: id,
      before: {
        name: existing.name,
        signerName: existing.signerName,
        signerTitle: existing.signerTitle,
      },
      after: {
        name: updated.name,
        signerName: updated.signerName,
        signerTitle: updated.signerTitle,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      signerName: updated.signerName,
      signerTitle: updated.signerTitle,
      paperSize: updated.paperSize,
      fieldLayout: updated.fieldLayout,
      isActive: updated.isActive,
      hasSignature: Boolean(updated.signatureKey),
      createdAt: updated.createdAt,
      certificatesCount: updated._count.certificates,
    };
  }

  async activate(id: string, user?: AuthenticatedUser): Promise<CertificateTemplateResponse> {
    const existing = await this.prisma.client.certificateTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Template sertifikat tidak ditemukan');
    }

    await this.prisma.client.$transaction(async (tx) => {
      // Nonaktifkan semua template lain
      await tx.certificateTemplate.updateMany({
        data: { isActive: false },
      });

      // Aktifkan template terpilih
      await tx.certificateTemplate.update({
        where: { id },
        data: { isActive: true },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'certificate_template.activate',
          entity: 'CertificateTemplate',
          entityId: id,
          before: { isActive: existing.isActive },
          after: { isActive: true },
        },
        tx,
      );
    });

    return this.findById(id);
  }

  async getDesignUrl(id: string): Promise<string> {
    const template = await this.prisma.client.certificateTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template sertifikat tidak ditemukan');
    }

    return this.storage.getPresignedDownloadUrl(template.fileKey, {
      filename: `${template.name}-desain.pdf`,
    });
  }

  async getSignatureUrl(id: string): Promise<string> {
    const template = await this.prisma.client.certificateTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template sertifikat tidak ditemukan');
    }

    if (!template.signatureKey) {
      throw new NotFoundException('Template tidak memiliki gambar tanda tangan');
    }

    return this.storage.getPresignedDownloadUrl(template.signatureKey, {
      filename: `${template.name}-ttd.png`,
    });
  }

  async getPreviewUrl(id: string): Promise<string> {
    const template = await this.prisma.client.certificateTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template sertifikat tidak ditemukan');
    }

    const previewKey = `templates/${template.id}/preview.png`;
    const exists = await this.storage.exists(previewKey);

    if (!exists) {
      // Generate preview PNG dari file PDF desain
      const pdfBuffer = await this.storage.getObject(template.fileKey);
      const pngBuffer = await renderPdfToPreviewPng(pdfBuffer);
      await this.storage.putObject(previewKey, pngBuffer, 'image/png');
    }

    return this.storage.getPresignedDownloadUrl(previewKey, {
      filename: `${template.name}-preview.png`,
    });
  }
}

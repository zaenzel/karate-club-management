import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CertificateStatus, ExamStatus } from '@karate/db';
import { CertificatesService } from './certificates.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';
import type { StorageService } from '../storage/storage.service.js';
import type { CertificateRenderQueue } from './certificate-render-queue.js';

describe('CertificatesService', () => {
  let service: CertificatesService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockStorage: any;
  let mockQueue: CertificateRenderQueue;

  beforeEach(() => {
    mockPrisma = {
      client: {
        certificateTemplate: {
          findFirst: vi.fn(),
        },
        certificate: {
          findFirst: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          count: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        examParticipant: {
          findMany: vi.fn(),
        },
        exam: {
          findUnique: vi.fn(),
        },
        $transaction: vi.fn(async (cb) => {
          if (Array.isArray(cb)) {
            return Promise.all(cb);
          }
          return cb(mockPrisma.client);
        }),
      },
    };

    mockAudit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    mockStorage = {
      getPresignedDownloadUrl: vi.fn().mockResolvedValue('http://localhost:9000/download-url'),
    };

    mockQueue = {
      enqueue: vi.fn().mockResolvedValue(undefined),
    };

    service = new CertificatesService(
      mockPrisma as unknown as PrismaService,
      mockAudit as unknown as AuditService,
      mockStorage as unknown as StorageService,
      mockQueue,
    );
  });

  describe('createForParticipants (tutup ujian)', () => {
    it('tanpa template aktif: lewati pembuatan, catat audit log, dan jangan gagalkan', async () => {
      mockPrisma.client.certificateTemplate.findFirst.mockResolvedValueOnce(null);

      const result = await service.createForParticipants(mockPrisma.client, 'exam-1', [
        'part-1',
        'part-2',
      ]);

      expect(result).toEqual([]);
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'certificate.skipped_no_template', entityId: 'exam-1' }),
        mockPrisma.client,
      );
      expect(mockPrisma.client.certificate.create).not.toHaveBeenCalled();
    });

    it('dengan template aktif: buat sertifikat PENDING untuk tiap peserta lulus', async () => {
      mockPrisma.client.certificateTemplate.findFirst.mockResolvedValueOnce({
        id: 'tmpl-active',
        name: 'Template 2026',
        isActive: true,
      });

      mockPrisma.client.examParticipant.findMany.mockResolvedValueOnce([
        { id: 'part-1', member: { id: 'mem-1' } },
        { id: 'part-2', member: { id: 'mem-2' } },
      ]);

      mockPrisma.client.certificate.findFirst
        .mockResolvedValueOnce({ number: 'C202600005' })
        .mockResolvedValueOnce({ number: 'C202600006' });

      mockPrisma.client.certificate.create
        .mockResolvedValueOnce({ id: 'cert-1', number: 'C202600006' })
        .mockResolvedValueOnce({ id: 'cert-2', number: 'C202600007' });

      const result = await service.createForParticipants(mockPrisma.client, 'exam-1', [
        'part-1',
        'part-2',
      ]);

      expect(result).toEqual(['cert-1', 'cert-2']);
      expect(mockPrisma.client.certificate.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.client.certificate.create).toHaveBeenCalledWith({
        data: {
          number: 'C202600006',
          memberId: 'mem-1',
          examParticipantId: 'part-1',
          templateId: 'tmpl-active',
          status: CertificateStatus.PENDING,
          isActive: true,
        },
      });
    });

    it('setelah commit (afterCommit), id sertifikat dimasukkan ke antrian render', async () => {
      mockPrisma.client.certificateTemplate.findFirst.mockResolvedValueOnce({
        id: 'tmpl-active',
        isActive: true,
      });
      mockPrisma.client.examParticipant.findMany.mockResolvedValueOnce([
        { id: 'part-1', member: { id: 'mem-1' } },
      ]);
      mockPrisma.client.certificate.findFirst.mockResolvedValueOnce(null);
      mockPrisma.client.certificate.create.mockResolvedValueOnce({ id: 'cert-10' });

      await service.handle(mockPrisma.client, 'exam-1', ['part-1']);
      expect(mockQueue.enqueue).not.toHaveBeenCalled(); // belum di-enqueue sebelum commit

      await service.afterCommit('exam-1');
      expect(mockQueue.enqueue).toHaveBeenCalledWith('cert-10');
    });
  });

  describe('reissue', () => {
    it('gagal jika sertifikat tidak ditemukan', async () => {
      mockPrisma.client.certificate.findUnique.mockResolvedValueOnce(null);

      await expect(service.reissue('cert-none')).rejects.toThrow(NotFoundException);
    });

    it('gagal jika sertifikat sudah tidak aktif', async () => {
      mockPrisma.client.certificate.findUnique.mockResolvedValueOnce({
        id: 'cert-old',
        isActive: false,
      });

      await expect(service.reissue('cert-old')).rejects.toThrow(ConflictException);
    });

    it('gagal jika tidak ada template aktif saat terbit ulang', async () => {
      mockPrisma.client.certificate.findUnique.mockResolvedValueOnce({
        id: 'cert-active',
        isActive: true,
      });
      mockPrisma.client.certificateTemplate.findFirst.mockResolvedValueOnce(null);

      await expect(service.reissue('cert-active')).rejects.toThrow(ConflictException);
    });

    it('berhasil terbit ulang: nonaktifkan lama, buat nomor baru, enqueue setelah commit', async () => {
      mockPrisma.client.certificate.findUnique.mockResolvedValueOnce({
        id: 'cert-old',
        number: 'C202600001',
        memberId: 'mem-1',
        examParticipantId: 'part-1',
        isActive: true,
      });
      mockPrisma.client.certificateTemplate.findFirst.mockResolvedValueOnce({
        id: 'tmpl-active',
        isActive: true,
      });
      mockPrisma.client.certificate.findFirst.mockResolvedValueOnce({ number: 'C202600009' });
      mockPrisma.client.certificate.create.mockResolvedValueOnce({
        id: 'cert-new',
        number: 'C202600010',
        isActive: true,
      });

      const result = await service.reissue('cert-old');

      expect(mockPrisma.client.certificate.update).toHaveBeenCalledWith({
        where: { id: 'cert-old' },
        data: { isActive: false },
      });
      expect(mockPrisma.client.certificate.create).toHaveBeenCalledWith({
        data: {
          number: 'C202600010',
          memberId: 'mem-1',
          examParticipantId: 'part-1',
          templateId: 'tmpl-active',
          status: CertificateStatus.PENDING,
          isActive: true,
        },
      });
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'certificate.reissue', entityId: 'cert-new' }),
        mockPrisma.client,
      );
      expect(mockQueue.enqueue).toHaveBeenCalledWith('cert-new');
      expect(result.id).toBe('cert-new');
    });
  });

  describe('backfill', () => {
    it('gagal jika ujian belum selesai (bukan FINISHED)', async () => {
      mockPrisma.client.exam.findUnique.mockResolvedValueOnce({
        id: 'exam-draft',
        status: ExamStatus.ONGOING,
      });

      await expect(service.backfill('exam-draft')).rejects.toThrow(ConflictException);
    });

    it('berhasil susulkan sertifikat untuk peserta lulus yang belum punya sertifikat aktif', async () => {
      mockPrisma.client.exam.findUnique.mockResolvedValueOnce({
        id: 'exam-finished',
        status: ExamStatus.FINISHED,
      });
      mockPrisma.client.certificateTemplate.findFirst.mockResolvedValue({
        id: 'tmpl-active',
        isActive: true,
      });
      mockPrisma.client.examParticipant.findMany
        .mockResolvedValueOnce([{ id: 'part-1' }]) // pencarian belum punya cert
        .mockResolvedValueOnce([{ id: 'part-1', member: { id: 'mem-1' } }]); // di createForParticipants

      mockPrisma.client.certificate.findFirst.mockResolvedValueOnce(null);
      mockPrisma.client.certificate.create.mockResolvedValueOnce({ id: 'cert-backfilled' });

      const result = await service.backfill('exam-finished');

      expect(result.createdCount).toBe(1);
      expect(result.certificateIds).toEqual(['cert-backfilled']);
      expect(mockQueue.enqueue).toHaveBeenCalledWith('cert-backfilled');
    });

    it('idempoten: jika semua peserta sudah punya sertifikat aktif, tidak ada sertifikat baru', async () => {
      mockPrisma.client.exam.findUnique.mockResolvedValueOnce({
        id: 'exam-finished',
        status: ExamStatus.FINISHED,
      });
      mockPrisma.client.certificateTemplate.findFirst.mockResolvedValue({
        id: 'tmpl-active',
        isActive: true,
      });
      mockPrisma.client.examParticipant.findMany.mockResolvedValueOnce([]); // kosong

      const result = await service.backfill('exam-finished');

      expect(result.createdCount).toBe(0);
      expect(result.certificateIds).toEqual([]);
      expect(mockQueue.enqueue).not.toHaveBeenCalled();
    });
  });

  describe('getDownloadUrl', () => {
    it('menolak 409 jika status bukan READY', async () => {
      mockPrisma.client.certificate.findUnique.mockResolvedValueOnce({
        id: 'cert-1',
        status: CertificateStatus.PENDING,
      });

      await expect(service.getDownloadUrl('cert-1', 'pdf')).rejects.toThrow(ConflictException);
    });

    it('mengembalikan url presigned jika status READY', async () => {
      mockPrisma.client.certificate.findUnique.mockResolvedValueOnce({
        id: 'cert-1',
        number: 'C202600001',
        status: CertificateStatus.READY,
        pdfKey: 'certificates/2026/cert-1.pdf',
      });

      const url = await service.getDownloadUrl('cert-1', 'pdf');
      expect(url).toBe('http://localhost:9000/download-url');
      expect(mockStorage.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'certificates/2026/cert-1.pdf',
        { filename: 'C202600001.pdf' },
      );
    });
  });

  describe('retry', () => {
    it('menolak 409 jika status bukan FAILED', async () => {
      mockPrisma.client.certificate.findUnique.mockResolvedValueOnce({
        id: 'cert-1',
        status: CertificateStatus.PENDING,
      });

      await expect(service.retry('cert-1')).rejects.toThrow(ConflictException);
    });

    it('mengubah status menjadi PENDING dan enqueue ke antrian', async () => {
      mockPrisma.client.certificate.findUnique.mockResolvedValueOnce({
        id: 'cert-fail',
        status: CertificateStatus.FAILED,
      });
      mockPrisma.client.certificate.update.mockResolvedValueOnce({
        id: 'cert-fail',
        status: CertificateStatus.PENDING,
      });

      await service.retry('cert-fail');

      expect(mockPrisma.client.certificate.update).toHaveBeenCalledWith({
        where: { id: 'cert-fail' },
        data: { status: CertificateStatus.PENDING },
      });
      expect(mockQueue.enqueue).toHaveBeenCalledWith('cert-fail');
    });
  });
});

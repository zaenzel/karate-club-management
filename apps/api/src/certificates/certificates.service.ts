import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CertificateStatus, ExamResult, ExamStatus, type Prisma } from '@karate/db';
import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { toPaginated, toSkipTake, type Paginated } from '../common/pagination.js';
import { toDateOnly, toNumber } from '../common/serialize.js';
import type { ExamFinishedHandler } from '../exams/exam-finished-handler.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import {
  CERTIFICATE_RENDER_QUEUE,
  type CertificateRenderQueue,
} from './certificate-render-queue.js';
import { getNextCertificateNumber } from './certificate-number.js';
import type { ListCertificatesQuery } from './dto/list-certificates.dto.js';

export interface CertificateListItem {
  id: string;
  number: string;
  status: CertificateStatus;
  isActive: boolean;
  issuedAt: Date;
  member: {
    id: string;
    memberNumber: string;
    name: string;
  };
  exam: {
    id: string;
    name: string;
    type: string;
    date: string;
  };
  grade: {
    belt: string;
    kyu: number | null;
    dan: number | null;
  };
  hasPdf: boolean;
  hasPng: boolean;
}

@Injectable()
export class CertificatesService implements ExamFinishedHandler {
  private readonly pendingEnqueues = new Map<string, string[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
    @Inject(CERTIFICATE_RENDER_QUEUE)
    private readonly renderQueue: CertificateRenderQueue,
  ) {}

  /**
   * Hook dipanggil saat ujian ditutup di dalam transaksi penutupan.
   */
  async handle(
    tx: Prisma.TransactionClient,
    examId: string,
    passedParticipantIds: string[],
  ): Promise<void> {
    const createdIds = await this.createForParticipants(tx, examId, passedParticipantIds);
    if (createdIds.length > 0) {
      this.pendingEnqueues.set(examId, createdIds);
    }
  }

  /**
   * Dipanggil setelah transaksi penutupan sukses commit.
   */
  async afterCommit(examId: string): Promise<void> {
    const ids = this.pendingEnqueues.get(examId) ?? [];
    this.pendingEnqueues.delete(examId);

    for (const id of ids) {
      await this.renderQueue.enqueue(id);
    }
  }

  /**
   * Membuat sertifikat status PENDING untuk peserta yang lulus di dalam transaksi.
   */
  async createForParticipants(
    tx: Prisma.TransactionClient,
    examId: string,
    passedParticipantIds: string[],
  ): Promise<string[]> {
    if (passedParticipantIds.length === 0) {
      return [];
    }

    // 1. Ambil template aktif
    const activeTemplate = await tx.certificateTemplate.findFirst({
      where: { isActive: true },
    });

    // Jika belum ada template aktif: JANGAN gagalkan tutup ujian, catat audit log lalu lewati
    if (!activeTemplate) {
      await this.audit.log(
        {
          action: 'certificate.skipped_no_template',
          entity: 'Exam',
          entityId: examId,
          after: {
            reason: 'Tidak ada template sertifikat aktif saat ujian ditutup',
            passedParticipantsCount: passedParticipantIds.length,
          },
        },
        tx,
      );
      return [];
    }

    // 2. Ambil peserta lulus yang BELUM punya sertifikat aktif (penjaga satu aktif per peserta)
    const eligibleParticipants = await tx.examParticipant.findMany({
      where: {
        id: { in: passedParticipantIds },
        certificates: {
          none: { isActive: true },
        },
      },
      include: {
        member: { select: { id: true } },
      },
    });

    const createdIds: string[] = [];

    // 3. Buat sertifikat PENDING
    for (const p of eligibleParticipants) {
      const number = await getNextCertificateNumber(tx);

      const cert = await tx.certificate.create({
        data: {
          number,
          memberId: p.member.id,
          examParticipantId: p.id,
          templateId: activeTemplate.id,
          status: CertificateStatus.PENDING,
          isActive: true,
        },
      });

      createdIds.push(cert.id);
    }

    return createdIds;
  }

  /**
   * Menerbitkan ulang sertifikat: nonaktifkan yang lama, buat baris baru nomor baru dengan template aktif.
   */
  async reissue(id: string, user?: AuthenticatedUser) {
    const newCert = await this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.certificate.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Sertifikat tidak ditemukan');
      }

      if (!existing.isActive) {
        throw new ConflictException('Hanya sertifikat aktif yang dapat diterbitkan ulang');
      }

      const activeTemplate = await tx.certificateTemplate.findFirst({
        where: { isActive: true },
      });

      if (!activeTemplate) {
        throw new ConflictException(
          'Tidak ada template sertifikat yang aktif untuk penerbitan ulang',
        );
      }

      // Nonaktifkan sertifikat lama
      await tx.certificate.update({
        where: { id },
        data: { isActive: false },
      });

      // Nomor unik baru
      const number = await getNextCertificateNumber(tx);

      // Buat sertifikat baru PENDING
      const created = await tx.certificate.create({
        data: {
          number,
          memberId: existing.memberId,
          examParticipantId: existing.examParticipantId,
          templateId: activeTemplate.id,
          status: CertificateStatus.PENDING,
          isActive: true,
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'certificate.reissue',
          entity: 'Certificate',
          entityId: created.id,
          before: { oldCertificateId: existing.id, oldNumber: existing.number, isActive: true },
          after: { newCertificateId: created.id, newNumber: created.number, isActive: true },
        },
        tx,
      );

      return created;
    });

    // Enqueue setelah commit berhasil
    await this.renderQueue.enqueue(newCert.id);

    return newCert;
  }

  /**
   * Menyusulkan sertifikat untuk ujian yang sudah Selesai (idempoten).
   */
  async backfill(examId: string, user?: AuthenticatedUser) {
    const exam = await this.prisma.client.exam.findUnique({
      where: { id: examId },
      select: { id: true, status: true },
    });

    if (!exam) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    if (exam.status !== ExamStatus.FINISHED) {
      throw new ConflictException(
        'Hanya ujian berstatus Selesai yang dapat disusulkan sertifikatnya',
      );
    }

    const activeTemplate = await this.prisma.client.certificateTemplate.findFirst({
      where: { isActive: true },
    });

    if (!activeTemplate) {
      throw new ConflictException('Tidak ada template sertifikat yang aktif');
    }

    const createdIds = await this.prisma.client.$transaction(async (tx) => {
      const passedWithoutCert = await tx.examParticipant.findMany({
        where: {
          examId,
          result: ExamResult.PASSED,
          certificates: {
            none: { isActive: true },
          },
        },
        select: { id: true },
      });

      const passedIds = passedWithoutCert.map((p) => p.id);
      const ids = await this.createForParticipants(tx, examId, passedIds);

      if (ids.length > 0) {
        await this.audit.log(
          {
            userId: user?.id,
            action: 'certificate.backfill',
            entity: 'Exam',
            entityId: examId,
            after: { count: ids.length, certificateIds: ids },
          },
          tx,
        );
      }

      return ids;
    });

    // Enqueue setelah commit
    for (const id of createdIds) {
      await this.renderQueue.enqueue(id);
    }

    return {
      createdCount: createdIds.length,
      certificateIds: createdIds,
    };
  }

  /**
   * List sertifikat dengan filter dan pagination.
   */
  async list(query: ListCertificatesQuery): Promise<Paginated<CertificateListItem>> {
    const where: Prisma.CertificateWhereInput = {};

    if (query.examId) {
      where.examParticipant = { examId: query.examId };
    }
    if (query.memberId) {
      where.memberId = query.memberId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    if (query.q) {
      where.OR = [
        { number: { contains: query.q, mode: 'insensitive' } },
        { member: { name: { contains: query.q, mode: 'insensitive' } } },
        { member: { memberNumber: { contains: query.q, mode: 'insensitive' } } },
      ];
    }

    const [rows, total] = await this.prisma.client.$transaction([
      this.prisma.client.certificate.findMany({
        where,
        ...toSkipTake(query),
        orderBy: { issuedAt: 'desc' },
        include: {
          member: { select: { id: true, memberNumber: true, name: true } },
          examParticipant: {
            include: {
              exam: { select: { id: true, name: true, type: true, date: true } },
              gradeHistory: {
                include: {
                  toBelt: { select: { name: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.client.certificate.count({ where }),
    ]);

    const data: CertificateListItem[] = rows.map((c) => ({
      id: c.id,
      number: c.number,
      status: c.status,
      isActive: c.isActive,
      issuedAt: c.issuedAt,
      member: {
        id: c.member.id,
        memberNumber: c.member.memberNumber,
        name: c.member.name,
      },
      exam: {
        id: c.examParticipant.exam.id,
        name: c.examParticipant.exam.name,
        type: c.examParticipant.exam.type,
        date: toDateOnly(c.examParticipant.exam.date),
      },
      grade: {
        belt: c.examParticipant.gradeHistory?.toBelt.name ?? '',
        kyu: c.examParticipant.gradeHistory?.toKyu
          ? toNumber(c.examParticipant.gradeHistory.toKyu)
          : null,
        dan: c.examParticipant.gradeHistory?.toDan ?? null,
      },
      hasPdf: Boolean(c.pdfKey),
      hasPng: Boolean(c.pngKey),
    }));

    return toPaginated(data, total, query);
  }

  /**
   * Detail satu sertifikat.
   */
  async findById(id: string) {
    const c = await this.prisma.client.certificate.findUnique({
      where: { id },
      include: {
        member: { select: { id: true, memberNumber: true, name: true } },
        template: { select: { id: true, name: true, signerName: true, signerTitle: true } },
        examParticipant: {
          include: {
            exam: { select: { id: true, name: true, type: true, date: true } },
            gradeHistory: {
              include: {
                toBelt: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!c) {
      throw new NotFoundException('Sertifikat tidak ditemukan');
    }

    return {
      id: c.id,
      number: c.number,
      status: c.status,
      isActive: c.isActive,
      issuedAt: c.issuedAt,
      member: {
        id: c.member.id,
        memberNumber: c.member.memberNumber,
        name: c.member.name,
      },
      template: c.template,
      exam: {
        id: c.examParticipant.exam.id,
        name: c.examParticipant.exam.name,
        type: c.examParticipant.exam.type,
        date: toDateOnly(c.examParticipant.exam.date),
      },
      grade: {
        belt: c.examParticipant.gradeHistory?.toBelt.name ?? '',
        kyu: c.examParticipant.gradeHistory?.toKyu
          ? toNumber(c.examParticipant.gradeHistory.toKyu)
          : null,
        dan: c.examParticipant.gradeHistory?.toDan ?? null,
      },
      hasPdf: Boolean(c.pdfKey),
      hasPng: Boolean(c.pngKey),
    };
  }

  /**
   * Menghasilkan presigned download URL untuk file sertifikat READY.
   */
  async getDownloadUrl(id: string, format: 'pdf' | 'png'): Promise<string> {
    const cert = await this.prisma.client.certificate.findUnique({
      where: { id },
    });

    if (!cert) {
      throw new NotFoundException('Sertifikat tidak ditemukan');
    }

    if (cert.status !== CertificateStatus.READY) {
      throw new ConflictException('Sertifikat belum siap diunduh');
    }

    const key = format === 'png' ? cert.pngKey : cert.pdfKey;
    if (!key) {
      throw new NotFoundException(`File ${format.toUpperCase()} belum tersedia`);
    }

    return this.storage.getPresignedDownloadUrl(key, {
      filename: `${cert.number}.${format}`,
    });
  }

  /**
   * Mencoba ulang sertifikat yang FAILED.
   */
  async retry(id: string, user?: AuthenticatedUser) {
    const cert = await this.prisma.client.certificate.findUnique({
      where: { id },
    });

    if (!cert) {
      throw new NotFoundException('Sertifikat tidak ditemukan');
    }

    if (cert.status !== CertificateStatus.FAILED) {
      throw new ConflictException('Hanya sertifikat berstatus Gagal yang dapat dicoba ulang');
    }

    const updated = await this.prisma.client.certificate.update({
      where: { id },
      data: { status: CertificateStatus.PENDING },
    });

    await this.audit.log({
      userId: user?.id,
      action: 'certificate.retry',
      entity: 'Certificate',
      entityId: id,
    });

    await this.renderQueue.enqueue(id);

    return updated;
  }
}

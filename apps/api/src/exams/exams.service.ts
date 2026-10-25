import { ConflictException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { ExamResult, ExamStatus, ExamType, GradeSource, PaymentStatus, Prisma } from '@karate/db';

import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { toPaginated, toSkipTake, type Paginated } from '../common/pagination.js';
import { toDateOnly, toNumber } from '../common/serialize.js';
import { DEFAULT_BLACK_BELT_ORDER, computeResultGrade } from '../members/grade-rules.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateExamDto } from './dto/create-exam.dto.js';
import type { ListExamsQuery } from './dto/list-exams.query.js';
import type {
  AddParticipantsDto,
  EligibleMembersQuery,
  ListParticipantsQuery,
  UpdatePaymentDto,
  UpdateResultDto,
} from './dto/participants.dto.js';
import type { SetExaminersDto } from './dto/set-examiners.dto.js';
import type { UpdateExamDto } from './dto/update-exam.dto.js';
import { EXAM_FINISHED_HANDLERS, type ExamFinishedHandler } from './exam-finished-handler.js';
import { canChangeType, canDelete, canEdit, canFinish, canStart } from './exam-status.js';

export type ExamStats = {
  participants: number;
  passed: number;
  failed: number;
  pending: number;
};

export type ExamResponse = {
  id: string;
  name: string;
  type: ExamType;
  date: string;
  location: string;
  baseFee: number;
  status: ExamStatus;
  branch: { id: string; name: string } | null;
  examiners: Array<{ id: string; name: string; isChief: boolean }>;
  stats: ExamStats;
  createdAt: Date;
  updatedAt: Date;
};

export type ExamParticipantResponse = {
  id: string;
  examId: string;
  member: {
    id: string;
    memberNumber: string;
    name: string;
    branch: { id: string; name: string };
  };
  from: {
    belt: { id: string; name: string; order: number; colorHex: string };
    kyu: number;
    dan: number | null;
  };
  fee: number;
  paymentStatus: PaymentStatus;
  result: ExamResult | null;
  kyuDecrease: number | null;
  danIncrease: number | null;
  toBelt: { id: string; name: string; order: number; colorHex: string } | null;
  preview: {
    belt: { id: string; name: string; order: number; colorHex: string };
    kyu: number;
    dan: number | null;
  } | null;
  createdAt: Date;
};

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Optional()
    @Inject(EXAM_FINISHED_HANDLERS)
    private readonly finishedHandlers: ExamFinishedHandler[] = [],
  ) {}

  // ---------------------------------------------------------------------------
  // TKT-011: Event Ujian & Penguji
  // ---------------------------------------------------------------------------

  async list(query: ListExamsQuery): Promise<Paginated<ExamResponse>> {
    const where: Prisma.ExamWhereInput = {};

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { location: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) {
        where.date.gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
      }
      if (query.dateTo) {
        where.date.lte = new Date(`${query.dateTo}T23:59:59.999Z`);
      }
    }

    const [rows, total] = await this.prisma.client.$transaction([
      this.prisma.client.exam.findMany({
        where,
        ...toSkipTake(query),
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          branch: { select: { id: true, name: true } },
          examiners: {
            select: { id: true, name: true, isChief: true },
            orderBy: [{ isChief: 'desc' }, { name: 'asc' }],
          },
          participants: {
            select: { result: true },
          },
        },
      }),
      this.prisma.client.exam.count({ where }),
    ]);

    const data: ExamResponse[] = rows.map((row) => {
      const stats = this.computeStats(row.participants);
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        date: toDateOnly(row.date),
        location: row.location,
        baseFee: row.baseFee,
        status: row.status,
        branch: row.branch,
        examiners: row.examiners,
        stats,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });

    return toPaginated(data, total, query);
  }

  async findById(id: string): Promise<ExamResponse> {
    const exam = await this.prisma.client.exam.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true } },
        examiners: {
          select: { id: true, name: true, isChief: true },
          orderBy: [{ isChief: 'desc' }, { name: 'asc' }],
        },
        participants: {
          select: { result: true },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    const stats = this.computeStats(exam.participants);

    return {
      id: exam.id,
      name: exam.name,
      type: exam.type,
      date: toDateOnly(exam.date),
      location: exam.location,
      baseFee: exam.baseFee,
      status: exam.status,
      branch: exam.branch,
      examiners: exam.examiners,
      stats,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    };
  }

  async create(dto: CreateExamDto, user?: AuthenticatedUser): Promise<ExamResponse> {
    if (dto.branchId) {
      const branchExists = await this.prisma.client.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (!branchExists) {
        throw new NotFoundException('Cabang penyelenggara tidak ditemukan');
      }
    }

    const created = await this.prisma.client.$transaction(async (tx) => {
      const row = await tx.exam.create({
        data: {
          name: dto.name,
          type: dto.type,
          date: new Date(`${dto.date}T00:00:00.000Z`),
          location: dto.location,
          baseFee: dto.baseFee,
          status: ExamStatus.DRAFT, // status selalu DRAFT saat pembuatan
          branchId: dto.branchId ?? null,
        },
        include: {
          branch: { select: { id: true, name: true } },
          examiners: {
            select: { id: true, name: true, isChief: true },
          },
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'exam.create',
          entity: 'Exam',
          entityId: row.id,
          after: {
            name: row.name,
            type: row.type,
            date: dto.date,
            location: row.location,
            baseFee: row.baseFee,
            branchId: row.branchId,
          },
        },
        tx,
      );

      return row;
    });

    return {
      id: created.id,
      name: created.name,
      type: created.type,
      date: toDateOnly(created.date),
      location: created.location,
      baseFee: created.baseFee,
      status: created.status,
      branch: created.branch,
      examiners: created.examiners,
      stats: { participants: 0, passed: 0, failed: 0, pending: 0 },
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async update(id: string, dto: UpdateExamDto, user?: AuthenticatedUser): Promise<ExamResponse> {
    const existing = await this.prisma.client.exam.findUnique({
      where: { id },
      include: {
        _count: { select: { participants: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    if (!canEdit(existing.status)) {
      throw new ConflictException('Ujian berstatus Selesai tidak bisa diubah');
    }

    if (dto.type && dto.type !== existing.type) {
      if (!canChangeType(existing.status, existing._count.participants)) {
        throw new ConflictException(
          'Jenis ujian hanya dapat diubah saat berstatus Draf dan belum memiliki peserta',
        );
      }
    }

    if (dto.branchId) {
      const branchExists = await this.prisma.client.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (!branchExists) {
        throw new NotFoundException('Cabang penyelenggara tidak ditemukan');
      }
    }

    // Catatan: Mengubah baseFee TIDAK mengubah fee peserta yang sudah terdaftar.
    await this.prisma.client.$transaction(async (tx) => {
      await tx.exam.update({
        where: { id },
        data: {
          name: dto.name,
          type: dto.type,
          date: dto.date ? new Date(`${dto.date}T00:00:00.000Z`) : undefined,
          location: dto.location,
          baseFee: dto.baseFee,
          branchId: dto.branchId !== undefined ? dto.branchId : undefined,
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'exam.update',
          entity: 'Exam',
          entityId: id,
          before: {
            name: existing.name,
            type: existing.type,
            date: toDateOnly(existing.date),
            location: existing.location,
            baseFee: existing.baseFee,
            branchId: existing.branchId,
          },
          after: {
            name: dto.name ?? existing.name,
            type: dto.type ?? existing.type,
            date: dto.date ?? toDateOnly(existing.date),
            location: dto.location ?? existing.location,
            baseFee: dto.baseFee ?? existing.baseFee,
            branchId: dto.branchId !== undefined ? dto.branchId : existing.branchId,
          },
        },
        tx,
      );
    });

    return this.findById(id);
  }

  async delete(id: string, user?: AuthenticatedUser): Promise<void> {
    const existing = await this.prisma.client.exam.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    if (!canDelete(existing.status)) {
      const statusLabel = existing.status === 'ONGOING' ? 'Berlangsung' : 'Selesai';
      throw new ConflictException(`Ujian berstatus ${statusLabel} tidak dapat dihapus`);
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.exam.delete({ where: { id } });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'exam.delete',
          entity: 'Exam',
          entityId: id,
          before: {
            name: existing.name,
            status: existing.status,
            date: toDateOnly(existing.date),
          },
        },
        tx,
      );
    });
  }

  async setExaminers(
    id: string,
    dto: SetExaminersDto,
    user?: AuthenticatedUser,
  ): Promise<ExamResponse> {
    const existing = await this.prisma.client.exam.findUnique({
      where: { id },
      include: { examiners: true },
    });

    if (!existing) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    if (existing.status === ExamStatus.FINISHED) {
      throw new ConflictException('Ujian berstatus Selesai tidak bisa diubah pengujinya');
    }

    await this.prisma.client.$transaction(async (tx) => {
      // Hapus seluruh penguji lama lalu buat baru
      await tx.examExaminer.deleteMany({ where: { examId: id } });

      await tx.examExaminer.createMany({
        data: dto.examiners.map((e) => ({
          examId: id,
          name: e.name,
          isChief: e.isChief,
        })),
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'exam.examiners',
          entity: 'Exam',
          entityId: id,
          before: existing.examiners.map((e) => ({ name: e.name, isChief: e.isChief })),
          after: dto.examiners,
        },
        tx,
      );
    });

    return this.findById(id);
  }

  async start(id: string, user?: AuthenticatedUser): Promise<ExamResponse> {
    const existing = await this.prisma.client.exam.findUnique({
      where: { id },
      include: {
        _count: {
          select: { examiners: true, participants: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    if (!canStart(existing.status)) {
      const statusLabel = existing.status === 'ONGOING' ? 'Berlangsung' : 'Selesai';
      throw new ConflictException(`Ujian berstatus ${statusLabel} tidak dapat dimulai`);
    }

    if (existing._count.examiners < 1 || existing._count.participants < 1) {
      const missing: string[] = [];
      if (existing._count.examiners < 1) missing.push('minimal satu penguji');
      if (existing._count.participants < 1) missing.push('minimal satu peserta');
      throw new ConflictException(
        `Ujian tidak dapat dimulai karena belum memiliki ${missing.join(' dan ')}`,
      );
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.exam.update({
        where: { id },
        data: { status: ExamStatus.ONGOING },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'exam.start',
          entity: 'Exam',
          entityId: id,
          before: { status: existing.status },
          after: { status: ExamStatus.ONGOING },
        },
        tx,
      );
    });

    return this.findById(id);
  }

  // ---------------------------------------------------------------------------
  // TKT-012: Peserta, Biaya & Hasil Ujian
  // ---------------------------------------------------------------------------

  async getParticipants(
    examId: string,
    query: ListParticipantsQuery = {},
  ): Promise<ExamParticipantResponse[]> {
    const exam = await this.prisma.client.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    const where: Prisma.ExamParticipantWhereInput = { examId };
    if (query.branchId) {
      where.member = { branchId: query.branchId };
    }
    if (query.result) {
      where.result = query.result;
    }
    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    const [participants, belts] = await Promise.all([
      this.prisma.client.examParticipant.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              memberNumber: true,
              name: true,
              branch: { select: { id: true, name: true } },
            },
          },
          fromBelt: {
            select: { id: true, name: true, order: true, colorHex: true },
          },
          toBelt: {
            select: { id: true, name: true, order: true, colorHex: true },
          },
        },
        orderBy: [{ member: { name: 'asc' } }],
      }),
      this.prisma.client.belt.findMany({
        orderBy: { order: 'asc' },
      }),
    ]);

    const blackBelt =
      belts.find((b) => b.order === DEFAULT_BLACK_BELT_ORDER) ?? belts[belts.length - 1];

    return participants.map((p) => {
      let preview: ExamParticipantResponse['preview'] = null;

      if (p.result === ExamResult.PASSED) {
        const targetBelt = p.toBelt ?? p.fromBelt;
        const res = computeResultGrade({
          examType: exam.type,
          from: {
            beltOrder: p.fromBelt.order,
            kyu: toNumber(p.fromKyu),
            dan: p.fromDan,
          },
          kyuDecrease: p.kyuDecrease ? toNumber(p.kyuDecrease) : undefined,
          danIncrease: p.danIncrease ?? undefined,
          toBeltOrder: targetBelt.order,
          blackOrder: blackBelt.order,
        });

        if (res.ok) {
          const previewBelt = belts.find((b) => b.order === res.to.beltOrder) ?? targetBelt;
          preview = {
            belt: previewBelt,
            kyu: res.to.kyu,
            dan: res.to.dan,
          };
        }
      }

      return {
        id: p.id,
        examId: p.examId,
        member: p.member,
        from: {
          belt: p.fromBelt,
          kyu: toNumber(p.fromKyu),
          dan: p.fromDan,
        },
        fee: p.fee,
        paymentStatus: p.paymentStatus,
        result: p.result,
        kyuDecrease: p.kyuDecrease ? toNumber(p.kyuDecrease) : null,
        danIncrease: p.danIncrease,
        toBelt: p.toBelt,
        preview,
        createdAt: p.createdAt,
      };
    });
  }

  async getEligibleMembers(examId: string, query: EligibleMembersQuery = {}) {
    const exam = await this.prisma.client.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    const belts = await this.prisma.client.belt.findMany({
      orderBy: { order: 'asc' },
    });
    const blackBelt =
      belts.find((b) => b.order === DEFAULT_BLACK_BELT_ORDER) ?? belts[belts.length - 1];

    // Ambil ID semua member yang saat ini terdaftar di ujian aktif mana pun (A7)
    const activeParticipants = await this.prisma.client.examParticipant.findMany({
      where: {
        exam: {
          status: { in: [ExamStatus.DRAFT, ExamStatus.ONGOING] },
        },
      },
      select: { memberId: true },
    });
    const activeMemberIds = activeParticipants.map((ap) => ap.memberId);

    const where: Prisma.MemberWhereInput = {
      id: { notIn: activeMemberIds },
    };

    if (exam.type === ExamType.KYU) {
      // Member non-hitam (belt.order < blackBelt.order)
      where.belt = { order: { lt: blackBelt.order } };
    } else {
      // Member hitam (belt.order >= blackBelt.order)
      where.belt = { order: { gte: blackBelt.order } };
    }

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { memberNumber: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const members = await this.prisma.client.member.findMany({
      where,
      take: 50,
      orderBy: { name: 'asc' },
      include: {
        branch: { select: { id: true, name: true } },
        belt: { select: { id: true, name: true, order: true, colorHex: true } },
      },
    });

    return members.map((m) => ({
      id: m.id,
      memberNumber: m.memberNumber,
      name: m.name,
      branch: m.branch,
      belt: m.belt,
      kyu: toNumber(m.kyu),
      dan: m.dan,
    }));
  }

  async addParticipants(examId: string, dto: AddParticipantsDto, user?: AuthenticatedUser) {
    const exam = await this.prisma.client.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    if (exam.status === ExamStatus.FINISHED) {
      throw new ConflictException('Tidak dapat mendaftarkan peserta ke ujian yang sudah Selesai');
    }

    const belts = await this.prisma.client.belt.findMany({
      orderBy: { order: 'asc' },
    });
    const blackBelt =
      belts.find((b) => b.order === DEFAULT_BLACK_BELT_ORDER) ?? belts[belts.length - 1];

    // Ambil data seluruh calon member
    const candidates = await this.prisma.client.member.findMany({
      where: { id: { in: dto.memberIds } },
      include: {
        branch: { select: { id: true, name: true } },
        belt: { select: { id: true, name: true, order: true, colorHex: true } },
        examParticipants: {
          where: {
            exam: {
              status: { in: [ExamStatus.DRAFT, ExamStatus.ONGOING] },
            },
          },
          select: { examId: true, exam: { select: { name: true } } },
        },
      },
    });

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));

    const validToInsert: Array<{
      examId: string;
      memberId: string;
      fromBeltId: string;
      fromKyu: Prisma.Decimal;
      fromDan: number | null;
      fee: number;
      paymentStatus: PaymentStatus;
    }> = [];

    const rejected: Array<{ memberId: string; name: string; reason: string }> = [];

    for (const memberId of dto.memberIds) {
      const member = candidateMap.get(memberId);
      if (!member) {
        rejected.push({
          memberId,
          name: 'Tidak dikenal',
          reason: 'Member tidak ditemukan',
        });
        continue;
      }

      // 1. Cek kesesuaian jenis ujian
      const isBlack = member.belt.order >= blackBelt.order;
      if (exam.type === ExamType.KYU && isBlack) {
        rejected.push({
          memberId,
          name: member.name,
          reason: 'Member bersabuk hitam tidak dapat didaftarkan pada ujian KYU',
        });
        continue;
      }
      if (exam.type === ExamType.DAN && !isBlack) {
        rejected.push({
          memberId,
          name: member.name,
          reason: 'Member non-sabuk hitam tidak dapat didaftarkan pada ujian DAN',
        });
        continue;
      }

      // 2. Cek apakah sudah terdaftar di event ini atau event aktif lain (A7)
      const existingInThisExam = member.examParticipants.some((p) => p.examId === examId);
      if (existingInThisExam) {
        rejected.push({
          memberId,
          name: member.name,
          reason: 'Member sudah terdaftar dalam ujian ini',
        });
        continue;
      }

      const activeInOtherExam = member.examParticipants.find((p) => p.examId !== examId);
      if (activeInOtherExam) {
        rejected.push({
          memberId,
          name: member.name,
          reason: `Member sudah terdaftar dalam ujian aktif lain (${activeInOtherExam.exam.name})`,
        });
        continue;
      }

      validToInsert.push({
        examId,
        memberId,
        fromBeltId: member.beltId,
        fromKyu: member.kyu,
        fromDan: member.dan,
        fee: exam.baseFee,
        paymentStatus: PaymentStatus.UNPAID,
      });
    }

    if (validToInsert.length > 0) {
      await this.prisma.client.$transaction(async (tx) => {
        await tx.examParticipant.createMany({
          data: validToInsert,
        });

        await this.audit.log(
          {
            userId: user?.id,
            action: 'exam.participants.add',
            entity: 'Exam',
            entityId: examId,
            after: {
              addedCount: validToInsert.length,
              memberIds: validToInsert.map((v) => v.memberId),
            },
          },
          tx,
        );
      });
    }

    return {
      addedCount: validToInsert.length,
      rejected,
    };
  }

  async removeParticipant(
    examId: string,
    participantId: string,
    user?: AuthenticatedUser,
  ): Promise<void> {
    const participant = await this.prisma.client.examParticipant.findUnique({
      where: { id: participantId },
      include: {
        exam: { select: { id: true, status: true } },
        member: { select: { id: true, name: true } },
      },
    });

    if (!participant || participant.examId !== examId) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    if (participant.exam.status === ExamStatus.FINISHED) {
      throw new ConflictException('Tidak dapat mengeluarkan peserta dari ujian yang sudah Selesai');
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.examParticipant.delete({ where: { id: participantId } });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'exam.participants.remove',
          entity: 'ExamParticipant',
          entityId: participantId,
          before: {
            examId,
            memberId: participant.member.id,
            memberName: participant.member.name,
          },
        },
        tx,
      );
    });
  }

  async updatePayment(
    examId: string,
    participantId: string,
    dto: UpdatePaymentDto,
    user?: AuthenticatedUser,
  ): Promise<void> {
    const participant = await this.prisma.client.examParticipant.findUnique({
      where: { id: participantId },
      include: {
        exam: { select: { id: true, status: true } },
      },
    });

    if (!participant || participant.examId !== examId) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    if (participant.exam.status === ExamStatus.FINISHED) {
      throw new ConflictException('Tidak dapat mengubah pembayaran pada ujian yang sudah Selesai');
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.examParticipant.update({
        where: { id: participantId },
        data: {
          fee: dto.fee !== undefined ? dto.fee : undefined,
          paymentStatus: dto.paymentStatus !== undefined ? dto.paymentStatus : undefined,
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'exam.participants.payment',
          entity: 'ExamParticipant',
          entityId: participantId,
          before: {
            fee: participant.fee,
            paymentStatus: participant.paymentStatus,
          },
          after: {
            fee: dto.fee ?? participant.fee,
            paymentStatus: dto.paymentStatus ?? participant.paymentStatus,
          },
        },
        tx,
      );
    });
  }

  async updateResult(
    examId: string,
    participantId: string,
    dto: UpdateResultDto,
    user?: AuthenticatedUser,
  ): Promise<void> {
    const participant = await this.prisma.client.examParticipant.findUnique({
      where: { id: participantId },
      include: {
        exam: { select: { id: true, type: true, status: true } },
        fromBelt: { select: { id: true, order: true } },
      },
    });

    if (!participant || participant.examId !== examId) {
      throw new NotFoundException('Peserta ujian tidak ditemukan');
    }

    if (participant.exam.status !== ExamStatus.ONGOING) {
      const statusLabel = participant.exam.status === ExamStatus.DRAFT ? 'Draf' : 'Selesai';
      throw new ConflictException(
        `Hasil ujian hanya dapat diisi saat ujian Berlangsung (status saat ini: ${statusLabel})`,
      );
    }

    if (dto.result === ExamResult.FAILED) {
      // FAILED membersihkan field penurunan kyu, kenaikan dan, dan toBeltId
      await this.prisma.client.$transaction(async (tx) => {
        await tx.examParticipant.update({
          where: { id: participantId },
          data: {
            result: ExamResult.FAILED,
            kyuDecrease: null,
            danIncrease: null,
            toBeltId: null,
          },
        });

        await this.audit.log(
          {
            userId: user?.id,
            action: 'exam.result',
            entity: 'ExamParticipant',
            entityId: participantId,
            before: {
              result: participant.result,
              kyuDecrease: participant.kyuDecrease ? toNumber(participant.kyuDecrease) : null,
              danIncrease: participant.danIncrease,
              toBeltId: participant.toBeltId,
            },
            after: {
              result: ExamResult.FAILED,
              kyuDecrease: null,
              danIncrease: null,
              toBeltId: null,
            },
          },
          tx,
        );
      });
      return;
    }

    // PASSED: default values and validate
    const belts = await this.prisma.client.belt.findMany({
      orderBy: { order: 'asc' },
    });
    const blackBelt =
      belts.find((b) => b.order === DEFAULT_BLACK_BELT_ORDER) ?? belts[belts.length - 1];

    const kyuDecrease = participant.exam.type === ExamType.KYU ? (dto.kyuDecrease ?? 1) : undefined;
    const danIncrease = participant.exam.type === ExamType.DAN ? (dto.danIncrease ?? 1) : undefined;

    let targetBeltId = dto.toBeltId ?? participant.fromBeltId;
    let targetBelt = belts.find((b) => b.id === targetBeltId);
    if (!targetBelt) {
      targetBelt = belts.find((b) => b.id === participant.fromBeltId)!;
      targetBeltId = targetBelt.id;
    }

    const validation = computeResultGrade({
      examType: participant.exam.type,
      from: {
        beltOrder: participant.fromBelt.order,
        kyu: toNumber(participant.fromKyu),
        dan: participant.fromDan,
      },
      kyuDecrease,
      danIncrease,
      toBeltOrder: targetBelt.order,
      blackOrder: blackBelt.order,
    });

    if (!validation.ok) {
      throw new ConflictException(validation.errors.join('; '));
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.examParticipant.update({
        where: { id: participantId },
        data: {
          result: ExamResult.PASSED,
          kyuDecrease: kyuDecrease !== undefined ? new Prisma.Decimal(kyuDecrease) : null,
          danIncrease: danIncrease ?? null,
          toBeltId: targetBeltId,
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'exam.result',
          entity: 'ExamParticipant',
          entityId: participantId,
          before: {
            result: participant.result,
            kyuDecrease: participant.kyuDecrease ? toNumber(participant.kyuDecrease) : null,
            danIncrease: participant.danIncrease,
            toBeltId: participant.toBeltId,
          },
          after: {
            result: ExamResult.PASSED,
            kyuDecrease,
            danIncrease,
            toBeltId: targetBeltId,
          },
        },
        tx,
      );
    });
  }

  // ---------------------------------------------------------------------------
  // TKT-013: Menutup Ujian Atomik & Riwayat Tingkatan
  // ---------------------------------------------------------------------------

  async finish(id: string, user?: AuthenticatedUser): Promise<ExamResponse> {
    const exam = await this.prisma.client.exam.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            member: { select: { id: true, name: true, beltId: true, kyu: true, dan: true } },
            fromBelt: { select: { id: true, order: true } },
            toBelt: { select: { id: true, order: true } },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Ujian tidak ditemukan');
    }

    if (!canFinish(exam.status)) {
      const statusLabel = exam.status === 'DRAFT' ? 'Draf' : 'Selesai';
      throw new ConflictException(
        exam.status === ExamStatus.FINISHED
          ? 'Ujian sudah selesai'
          : `Ujian tidak dapat ditutup karena masih berstatus ${statusLabel}`,
      );
    }

    if (exam.participants.length === 0) {
      throw new ConflictException('Ujian minimal harus memiliki satu peserta untuk ditutup');
    }

    // A8: Semua peserta wajib punya hasil
    const unassessed = exam.participants.filter((p) => p.result === null);
    if (unassessed.length > 0) {
      const names = unassessed.slice(0, 5).map((p) => p.member.name);
      const remainingCount = unassessed.length - names.length;
      const namesText =
        remainingCount > 0 ? `${names.join(', ')} dan ${remainingCount} lainnya` : names.join(', ');
      throw new ConflictException(
        `Semua peserta wajib memiliki hasil ujian sebelum ditutup. Masih ada ${unassessed.length} peserta belum dinilai: ${namesText}`,
      );
    }

    const belts = await this.prisma.client.belt.findMany({
      orderBy: { order: 'asc' },
    });
    const blackBelt =
      belts.find((b) => b.order === DEFAULT_BLACK_BELT_ORDER) ?? belts[belts.length - 1];

    const passedParticipantIds: string[] = [];

    // Transaksi atomik penutupan ujian
    await this.prisma.client.$transaction(
      async (tx) => {
        // Kunci baris exam / cek ulang status agar tidak double finish
        const currentExam = await tx.exam.findUnique({
          where: { id },
          select: { status: true },
        });

        if (currentExam?.status !== ExamStatus.ONGOING) {
          throw new ConflictException('Ujian sudah selesai');
        }

        let passedCount = 0;
        let failedCount = 0;

        for (const p of exam.participants) {
          if (p.result === ExamResult.FAILED) {
            failedCount++;
            continue;
          }

          passedCount++;
          passedParticipantIds.push(p.id);

          // Cek konsistensi snapshot dengan tingkatan member saat ini (A7)
          const currentMember = await tx.member.findUnique({
            where: { id: p.member.id },
            select: { beltId: true, kyu: true, dan: true, name: true },
          });

          if (!currentMember) {
            throw new NotFoundException(`Member ${p.member.name} tidak ditemukan`);
          }

          if (
            currentMember.beltId !== p.fromBeltId ||
            toNumber(currentMember.kyu) !== toNumber(p.fromKyu) ||
            currentMember.dan !== p.fromDan
          ) {
            throw new ConflictException(
              `Tingkatan member ${currentMember.name} saat ini berbeda dari data snapshot saat didaftarkan ujian`,
            );
          }

          // Hitung tingkatan baru via computeResultGrade
          const targetBelt = p.toBelt ?? p.fromBelt;
          const kyuDecrease = p.kyuDecrease ? toNumber(p.kyuDecrease) : 1;
          const danIncrease = p.danIncrease ?? 1;

          const res = computeResultGrade({
            examType: exam.type,
            from: {
              beltOrder: p.fromBelt.order,
              kyu: toNumber(p.fromKyu),
              dan: p.fromDan,
            },
            kyuDecrease: exam.type === ExamType.KYU ? kyuDecrease : undefined,
            danIncrease: exam.type === ExamType.DAN ? danIncrease : undefined,
            toBeltOrder: targetBelt.order,
            blackOrder: blackBelt.order,
          });

          if (!res.ok) {
            throw new ConflictException(
              `Gagal menghitung tingkatan baru untuk member ${currentMember.name}: ${res.errors.join('; ')}`,
            );
          }

          const newBelt = belts.find((b) => b.order === res.to.beltOrder)!;

          // Buat GradeHistory source = EXAM
          await tx.gradeHistory.create({
            data: {
              memberId: p.member.id,
              source: GradeSource.EXAM,
              examParticipantId: p.id,
              fromBeltId: p.fromBeltId,
              toBeltId: newBelt.id,
              fromKyu: p.fromKyu,
              toKyu: new Prisma.Decimal(res.to.kyu),
              fromDan: p.fromDan,
              toDan: res.to.dan,
              occurredAt: exam.date,
            },
          });

          // Perbarui cache nilai terakhir pada tabel members
          await tx.member.update({
            where: { id: p.member.id },
            data: {
              beltId: newBelt.id,
              kyu: new Prisma.Decimal(res.to.kyu),
              dan: res.to.dan,
            },
          });
        }

        // Ubah status ujian menjadi FINISHED
        await tx.exam.update({
          where: { id },
          data: { status: ExamStatus.FINISHED },
        });

        // Audit log exam.finish
        await this.audit.log(
          {
            userId: user?.id,
            action: 'exam.finish',
            entity: 'Exam',
            entityId: id,
            after: {
              status: ExamStatus.FINISHED,
              totalParticipants: exam.participants.length,
              passed: passedCount,
              failed: failedCount,
            },
          },
          tx,
        );

        // Panggil hook handlers (untuk pembuatan sertifikat TKT-018 nanti) di dalam transaksi yang sama
        for (const handler of this.finishedHandlers) {
          await handler.handle(tx, id, passedParticipantIds);
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    // Panggil afterCommit handlers setelah transaksi sukses commit (misal enqueuing render job)
    for (const handler of this.finishedHandlers) {
      if (handler.afterCommit) {
        await handler.afterCommit(id);
      }
    }

    return this.findById(id);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private computeStats(participants: Array<{ result: ExamResult | null }>): ExamStats {
    let passed = 0;
    let failed = 0;
    let pending = 0;

    for (const p of participants) {
      if (p.result === ExamResult.PASSED) {
        passed++;
      } else if (p.result === ExamResult.FAILED) {
        failed++;
      } else {
        pending++;
      }
    }

    return {
      participants: participants.length,
      passed,
      failed,
      pending,
    };
  }
}

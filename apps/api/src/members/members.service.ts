import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GradeSource, MemberType, Prisma } from '@karate/db';

import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { toPaginated, toSkipTake, type Paginated } from '../common/pagination.js';
import { toDateOnly, toNumber } from '../common/serialize.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateMemberDto } from './dto/create-member.dto.js';
import type { ListMembersQuery } from './dto/list-members.query.js';
import type { UpdateMemberDto } from './dto/update-member.dto.js';
import { DEFAULT_BLACK_BELT_ORDER, validateGrade } from './grade-rules.js';
import { getNextMemberNumber } from './member-number.js';

export type MemberResponse = {
  id: string;
  memberNumber: string;
  type: MemberType;
  name: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  phone: string | null;
  branch: { id: string; code: string; name: string };
  belt: { id: string; name: string; order: number; colorHex: string };
  kyu: number;
  dan: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GradeHistoryResponse = {
  id: string;
  source: GradeSource;
  fromBelt: { id: string; name: string; order: number; colorHex: string } | null;
  toBelt: { id: string; name: string; order: number; colorHex: string };
  fromKyu: number | null;
  toKyu: number;
  fromDan: number | null;
  toDan: number | null;
  occurredAt: Date;
  exam: { id: string; name: string; date: string } | null;
};

export function toMemberResponse(member: {
  id: string;
  memberNumber: string;
  type: MemberType;
  name: string;
  birthPlace: string;
  birthDate: Date;
  address: string;
  phone: string | null;
  branch: { id: string; code: string; name: string };
  belt: { id: string; name: string; order: number; colorHex: string };
  kyu: { toNumber(): number } | number;
  dan: number | null;
  createdAt: Date;
  updatedAt: Date;
}): MemberResponse {
  return {
    id: member.id,
    memberNumber: member.memberNumber,
    type: member.type,
    name: member.name,
    birthPlace: member.birthPlace,
    birthDate: toDateOnly(member.birthDate),
    address: member.address,
    phone: member.phone,
    branch: member.branch,
    belt: member.belt,
    kyu: typeof member.kyu === 'number' ? member.kyu : toNumber(member.kyu),
    dan: member.dan,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListMembersQuery): Promise<Paginated<MemberResponse>> {
    const where: Prisma.MemberWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.beltId && { beltId: query.beltId }),
      ...(query.q && {
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { memberNumber: { contains: query.q, mode: 'insensitive' } },
        ],
      }),
    };

    const [rows, total] = await this.prisma.client.$transaction([
      this.prisma.client.member.findMany({
        where,
        ...toSkipTake(query),
        orderBy: { name: 'asc' },
        include: {
          branch: { select: { id: true, code: true, name: true } },
          belt: { select: { id: true, name: true, order: true, colorHex: true } },
        },
      }),
      this.prisma.client.member.count({ where }),
    ]);

    const data = rows.map(toMemberResponse);
    return toPaginated(data, total, query);
  }

  async findById(id: string): Promise<MemberResponse> {
    const member = await this.prisma.client.member.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, code: true, name: true } },
        belt: { select: { id: true, name: true, order: true, colorHex: true } },
      },
    });

    if (!member) {
      throw new NotFoundException('Member tidak ditemukan');
    }

    return toMemberResponse(member);
  }

  async create(dto: CreateMemberDto, user?: AuthenticatedUser): Promise<MemberResponse> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        return await this.prisma.client.$transaction(async (tx) => {
          // 1. Verifikasi cabang ada
          const branch = await tx.branch.findUnique({
            where: { id: dto.branchId },
            select: { id: true, code: true, name: true },
          });
          if (!branch) {
            throw new NotFoundException('Cabang tidak ditemukan');
          }

          // 2. Tentukan tingkatan awal
          let targetBeltId: string;
          let targetKyu: number;
          let targetDan: number | null = null;

          if (dto.initialGrade) {
            const belt = await tx.belt.findUnique({
              where: { id: dto.initialGrade.beltId },
            });
            if (!belt) {
              throw new NotFoundException('Sabuk tidak ditemukan');
            }

            let dan = dto.initialGrade.dan;
            if (belt.order === DEFAULT_BLACK_BELT_ORDER && (dan === undefined || dan === null)) {
              dan = 1; // Asumsi A4: sabuk hitam tanpa dan default ke dan 1
            }

            const errors = validateGrade({
              beltOrder: belt.order,
              kyu: dto.initialGrade.kyu,
              dan,
              blackOrder: DEFAULT_BLACK_BELT_ORDER,
            });

            if (errors.length > 0) {
              throw new ConflictException(errors.join(', '));
            }

            targetBeltId = belt.id;
            targetKyu = dto.initialGrade.kyu;
            targetDan = dan ?? null;
          } else {
            // Default: sabuk putih (order 1), kyu 10, dan null
            const whiteBelt = await tx.belt.findFirst({
              where: { order: 1 },
            });
            if (!whiteBelt) {
              throw new ConflictException('Sabuk putih (urutan 1) belum terdaftar di sistem');
            }

            targetBeltId = whiteBelt.id;
            targetKyu = 10;
            targetDan = null;
          }

          // 3. Buat nomor anggota
          const memberNumber = await getNextMemberNumber(tx);

          // 4. Insert Member
          const member = await tx.member.create({
            data: {
              memberNumber,
              type: dto.type,
              name: dto.name,
              birthPlace: dto.birthPlace,
              birthDate: new Date(`${dto.birthDate}T00:00:00.000Z`),
              address: dto.address,
              phone: dto.phone,
              branchId: dto.branchId,
              beltId: targetBeltId,
              kyu: new Prisma.Decimal(targetKyu),
              dan: targetDan,
            },
            include: {
              branch: { select: { id: true, code: true, name: true } },
              belt: { select: { id: true, name: true, order: true, colorHex: true } },
            },
          });

          // 5. Insert GradeHistory sumber INITIAL
          await tx.gradeHistory.create({
            data: {
              memberId: member.id,
              source: GradeSource.INITIAL,
              fromBeltId: null,
              fromKyu: null,
              fromDan: null,
              toBeltId: targetBeltId,
              toKyu: new Prisma.Decimal(targetKyu),
              toDan: targetDan,
            },
          });

          // 6. Audit log
          await this.audit.log(
            {
              userId: user?.id,
              action: 'member.create',
              entity: 'Member',
              entityId: member.id,
              after: member,
            },
            tx,
          );

          return toMemberResponse(member);
        });
      } catch (error: any) {
        // Jika bentrok unique memberNumber (P2002), ulangi jika masih ada sisa attempt
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          (error.meta?.target as string[] | undefined)?.includes('member_number') &&
          attempt < maxRetries
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('Gagal membuat nomor anggota unik. Silakan coba lagi.');
  }

  async update(
    id: string,
    dto: UpdateMemberDto,
    user?: AuthenticatedUser,
  ): Promise<MemberResponse> {
    const existing = await this.prisma.client.member.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, code: true, name: true } },
        belt: { select: { id: true, name: true, order: true, colorHex: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Member tidak ditemukan');
    }

    if (dto.branchId && dto.branchId !== existing.branchId) {
      const branchExists = await this.prisma.client.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (!branchExists) {
        throw new NotFoundException('Cabang tidak ditemukan');
      }
    }

    return this.prisma.client.$transaction(async (tx) => {
      const updated = await tx.member.update({
        where: { id },
        data: {
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.birthPlace !== undefined && { birthPlace: dto.birthPlace }),
          ...(dto.birthDate !== undefined && {
            birthDate: new Date(`${dto.birthDate}T00:00:00.000Z`),
          }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.branchId !== undefined && { branchId: dto.branchId }),
        },
        include: {
          branch: { select: { id: true, code: true, name: true } },
          belt: { select: { id: true, name: true, order: true, colorHex: true } },
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'member.update',
          entity: 'Member',
          entityId: id,
          before: existing,
          after: updated,
        },
        tx,
      );

      return toMemberResponse(updated);
    });
  }

  async delete(id: string, user?: AuthenticatedUser): Promise<{ message: string }> {
    const existing = await this.prisma.client.member.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            examParticipants: true,
            certificates: true,
            headOfBranch: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Member tidak ditemukan');
    }

    if (existing._count.examParticipants > 0 || existing._count.certificates > 0) {
      throw new ConflictException(
        'Member tidak dapat dihapus karena sudah memiliki riwayat ujian atau sertifikat',
      );
    }

    if (existing._count.headOfBranch > 0) {
      throw new ConflictException(
        'Member tidak dapat dihapus karena masih menjabat sebagai kepala cabang',
      );
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.member.delete({ where: { id } });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'member.delete',
          entity: 'Member',
          entityId: id,
          before: existing,
        },
        tx,
      );
    });

    return { message: 'Member berhasil dihapus' };
  }

  async getGradeHistory(id: string): Promise<GradeHistoryResponse[]> {
    const member = await this.prisma.client.member.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException('Member tidak ditemukan');
    }

    const histories = await this.prisma.client.gradeHistory.findMany({
      where: { memberId: id },
      orderBy: { occurredAt: 'desc' },
      include: {
        fromBelt: { select: { id: true, name: true, order: true, colorHex: true } },
        toBelt: { select: { id: true, name: true, order: true, colorHex: true } },
        examParticipant: {
          include: {
            exam: { select: { id: true, name: true, date: true } },
          },
        },
      },
    });

    return histories.map((item) => ({
      id: item.id,
      source: item.source,
      fromBelt: item.fromBelt,
      toBelt: item.toBelt,
      fromKyu: item.fromKyu ? toNumber(item.fromKyu) : null,
      toKyu: toNumber(item.toKyu),
      fromDan: item.fromDan,
      toDan: item.toDan,
      occurredAt: item.occurredAt,
      exam: item.examParticipant?.exam
        ? {
            id: item.examParticipant.exam.id,
            name: item.examParticipant.exam.name,
            date: toDateOnly(item.examParticipant.exam.date),
          }
        : null,
    }));
  }
}

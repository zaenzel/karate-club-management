import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MemberType, type Prisma } from '@karate/db';

import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { toPaginated, toSkipTake, type Paginated } from '../common/pagination.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateBranchDto } from './dto/create-branch.dto.js';
import type { ListBranchesQuery } from './dto/list-branches.query.js';
import type { UpdateBranchDto } from './dto/update-branch.dto.js';

export type BranchResponse = {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  headCoach: { id: string; name: string } | null;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BranchOption = {
  id: string;
  code: string;
  name: string;
};

export function toBranchResponse(branch: {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  headCoach?: { id: string; name: string } | null;
  _count?: { members: number };
  createdAt: Date;
  updatedAt: Date;
}): BranchResponse {
  return {
    id: branch.id,
    code: branch.code,
    name: branch.name,
    city: branch.city,
    address: branch.address,
    phone: branch.phone,
    headCoach: branch.headCoach ? { id: branch.headCoach.id, name: branch.headCoach.name } : null,
    memberCount: branch._count?.members ?? 0,
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  };
}

@Injectable()
export class BranchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListBranchesQuery): Promise<Paginated<BranchResponse>> {
    const where: Prisma.BranchWhereInput = query.q
      ? {
          OR: [
            { code: { contains: query.q, mode: 'insensitive' } },
            { name: { contains: query.q, mode: 'insensitive' } },
            { city: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [rows, total] = await this.prisma.client.$transaction([
      this.prisma.client.branch.findMany({
        where,
        ...toSkipTake(query),
        orderBy: { name: 'asc' },
        include: {
          headCoach: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      }),
      this.prisma.client.branch.count({ where }),
    ]);

    const data = rows.map(toBranchResponse);
    return toPaginated(data, total, query);
  }

  async options(): Promise<BranchOption[]> {
    return this.prisma.client.branch.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<BranchResponse> {
    const branch = await this.prisma.client.branch.findUnique({
      where: { id },
      include: {
        headCoach: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    });

    if (!branch) {
      throw new NotFoundException('Cabang tidak ditemukan');
    }

    return toBranchResponse(branch);
  }

  async create(dto: CreateBranchDto, user?: AuthenticatedUser): Promise<BranchResponse> {
    if (dto.headCoachId) {
      const coach = await this.prisma.client.member.findUnique({
        where: { id: dto.headCoachId },
      });
      if (!coach || coach.type !== MemberType.COACH) {
        throw new ConflictException('Kepala cabang harus member bertipe coach');
      }
    }

    return this.prisma.client.$transaction(async (tx) => {
      const branch = await tx.branch.create({
        data: {
          code: dto.code,
          name: dto.name,
          city: dto.city,
          address: dto.address,
          phone: dto.phone,
          headCoachId: dto.headCoachId,
        },
        include: {
          headCoach: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'branch.create',
          entity: 'Branch',
          entityId: branch.id,
          after: branch,
        },
        tx,
      );

      return toBranchResponse(branch);
    });
  }

  async update(
    id: string,
    dto: UpdateBranchDto,
    user?: AuthenticatedUser,
  ): Promise<BranchResponse> {
    const existing = await this.prisma.client.branch.findUnique({
      where: { id },
      include: {
        headCoach: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Cabang tidak ditemukan');
    }

    if (dto.headCoachId) {
      const coach = await this.prisma.client.member.findUnique({
        where: { id: dto.headCoachId },
      });
      if (!coach || coach.type !== MemberType.COACH) {
        throw new ConflictException('Kepala cabang harus member bertipe coach');
      }
    }

    return this.prisma.client.$transaction(async (tx) => {
      const updated = await tx.branch.update({
        where: { id },
        data: {
          ...(dto.code !== undefined && { code: dto.code }),
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.city !== undefined && { city: dto.city }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.headCoachId !== undefined && { headCoachId: dto.headCoachId }),
        },
        include: {
          headCoach: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'branch.update',
          entity: 'Branch',
          entityId: id,
          before: existing,
          after: updated,
        },
        tx,
      );

      return toBranchResponse(updated);
    });
  }

  async delete(id: string, user?: AuthenticatedUser): Promise<{ message: string }> {
    const existing = await this.prisma.client.branch.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true, exams: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Cabang tidak ditemukan');
    }

    if (existing._count.members > 0 || existing._count.exams > 0) {
      throw new ConflictException('Cabang masih dipakai oleh member atau ujian');
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.branch.delete({ where: { id } });
      await this.audit.log(
        {
          userId: user?.id,
          action: 'branch.delete',
          entity: 'Branch',
          entityId: id,
          before: existing,
        },
        tx,
      );
    });

    return { message: 'Cabang berhasil dihapus' };
  }
}

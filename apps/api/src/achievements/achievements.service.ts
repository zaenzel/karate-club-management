import { Injectable, NotFoundException } from '@nestjs/common';
import type { AchievementLevel } from '@karate/db';

import { AuditService } from '../audit/audit.service.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { toDateOnly } from '../common/serialize.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateAchievementDto } from './dto/create-achievement.dto.js';
import type { UpdateAchievementDto } from './dto/update-achievement.dto.js';

export type AchievementResponse = {
  id: string;
  memberId: string;
  championship: string;
  level: AchievementLevel;
  category: string | null;
  result: string;
  date: string;
  location: string | null;
  createdAt: Date;
};

export function toAchievementResponse(achievement: {
  id: string;
  memberId: string;
  championship: string;
  level: AchievementLevel;
  category: string | null;
  result: string;
  date: Date;
  location: string | null;
  createdAt: Date;
}): AchievementResponse {
  return {
    id: achievement.id,
    memberId: achievement.memberId,
    championship: achievement.championship,
    level: achievement.level,
    category: achievement.category,
    result: achievement.result,
    date: toDateOnly(achievement.date),
    location: achievement.location,
    createdAt: achievement.createdAt,
  };
}

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listByMemberId(memberId: string): Promise<AchievementResponse[]> {
    const member = await this.prisma.client.member.findUnique({
      where: { id: memberId },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException('Member tidak ditemukan');
    }

    const rows = await this.prisma.client.achievement.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
    });

    return rows.map(toAchievementResponse);
  }

  async create(
    memberId: string,
    dto: CreateAchievementDto,
    user?: AuthenticatedUser,
  ): Promise<AchievementResponse> {
    const member = await this.prisma.client.member.findUnique({
      where: { id: memberId },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException('Member tidak ditemukan');
    }

    return this.prisma.client.$transaction(async (tx) => {
      const achievement = await tx.achievement.create({
        data: {
          memberId,
          championship: dto.championship,
          level: dto.level,
          category: dto.category,
          result: dto.result,
          date: new Date(`${dto.date}T00:00:00.000Z`),
          location: dto.location,
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'achievement.create',
          entity: 'Achievement',
          entityId: achievement.id,
          after: achievement,
        },
        tx,
      );

      return toAchievementResponse(achievement);
    });
  }

  async update(
    id: string,
    dto: UpdateAchievementDto,
    user?: AuthenticatedUser,
  ): Promise<AchievementResponse> {
    const existing = await this.prisma.client.achievement.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Prestasi tidak ditemukan');
    }

    return this.prisma.client.$transaction(async (tx) => {
      const updated = await tx.achievement.update({
        where: { id },
        data: {
          ...(dto.championship !== undefined && { championship: dto.championship }),
          ...(dto.level !== undefined && { level: dto.level }),
          ...(dto.category !== undefined && { category: dto.category }),
          ...(dto.result !== undefined && { result: dto.result }),
          ...(dto.date !== undefined && { date: new Date(`${dto.date}T00:00:00.000Z`) }),
          ...(dto.location !== undefined && { location: dto.location }),
        },
      });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'achievement.update',
          entity: 'Achievement',
          entityId: id,
          before: existing,
          after: updated,
        },
        tx,
      );

      return toAchievementResponse(updated);
    });
  }

  async delete(id: string, user?: AuthenticatedUser): Promise<{ message: string }> {
    const existing = await this.prisma.client.achievement.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Prestasi tidak ditemukan');
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.achievement.delete({ where: { id } });

      await this.audit.log(
        {
          userId: user?.id,
          action: 'achievement.delete',
          entity: 'Achievement',
          entityId: id,
          before: existing,
        },
        tx,
      );
    });

    return { message: 'Prestasi berhasil dihapus' };
  }
}

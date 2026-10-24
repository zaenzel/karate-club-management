import { NotFoundException } from '@nestjs/common';
import { AchievementLevel } from '@karate/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AchievementsService } from './achievements.service.js';

describe('AchievementsService', () => {
  let service: AchievementsService;
  let prisma: any;
  let audit: any;

  beforeEach(() => {
    prisma = {
      client: {
        $transaction: vi.fn((callback) => callback(prisma.client)),
        member: {
          findUnique: vi.fn(),
        },
        achievement: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    service = new AchievementsService(prisma, audit);
  });

  describe('listByMemberId', () => {
    it('mengembalikan daftar prestasi terurut tanggal', async () => {
      prisma.client.member.findUnique.mockResolvedValue({ id: 'm-1' });
      prisma.client.achievement.findMany.mockResolvedValue([
        {
          id: 'ach-1',
          memberId: 'm-1',
          championship: 'Kejurnas Karate 2026',
          level: AchievementLevel.NATIONAL,
          category: 'Kumite -60kg',
          result: 'Juara 1',
          date: new Date('2026-03-01T00:00:00.000Z'),
          location: 'Jakarta',
          createdAt: new Date(),
        },
      ]);

      const result = await service.listByMemberId('m-1');
      expect(result).toHaveLength(1);
      expect(result[0].championship).toBe('Kejurnas Karate 2026');
      expect(result[0].date).toBe('2026-03-01');
    });

    it('melempar NotFoundException bila member tidak ada', async () => {
      prisma.client.member.findUnique.mockResolvedValue(null);

      await expect(service.listByMemberId('m-none')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('berhasil membuat prestasi untuk member', async () => {
      prisma.client.member.findUnique.mockResolvedValue({ id: 'm-1' });
      prisma.client.achievement.create.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: 'ach-new',
          ...data,
          createdAt: new Date(),
        }),
      );

      const result = await service.create('m-1', {
        championship: 'Kejurda Jabar',
        level: AchievementLevel.PROVINCE,
        category: 'Kata',
        result: 'Juara 2',
        date: '2026-02-10',
      });

      expect(result.id).toBe('ach-new');
      expect(result.result).toBe('Juara 2');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'achievement.create', entityId: 'ach-new' }),
        expect.anything(),
      );
    });

    it('melempar NotFoundException bila member tidak ditemukan', async () => {
      prisma.client.member.findUnique.mockResolvedValue(null);

      await expect(
        service.create('m-none', {
          championship: 'Kejuaraan',
          level: AchievementLevel.OTHER,
          result: 'Emas',
          date: '2026-01-01',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('memperbarui prestasi yang ada', async () => {
      prisma.client.achievement.findUnique.mockResolvedValue({
        id: 'ach-1',
        championship: 'Old Name',
      });
      prisma.client.achievement.update.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: 'ach-1',
          memberId: 'm-1',
          championship: data.championship ?? 'Old Name',
          level: AchievementLevel.CITY,
          category: null,
          result: 'Perak',
          date: new Date('2026-01-01T00:00:00.000Z'),
          location: null,
          createdAt: new Date(),
        }),
      );

      const result = await service.update('ach-1', {
        championship: 'New Championship Name',
      });

      expect(result.championship).toBe('New Championship Name');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'achievement.update', entityId: 'ach-1' }),
        expect.anything(),
      );
    });

    it('melempar NotFoundException bila prestasi tidak ada', async () => {
      prisma.client.achievement.findUnique.mockResolvedValue(null);

      await expect(service.update('ach-none', { championship: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('menghapus prestasi yang ada', async () => {
      prisma.client.achievement.findUnique.mockResolvedValue({ id: 'ach-1' });
      prisma.client.achievement.delete.mockResolvedValue({ id: 'ach-1' });

      const res = await service.delete('ach-1');
      expect(res.message).toBe('Prestasi berhasil dihapus');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'achievement.delete', entityId: 'ach-1' }),
        expect.anything(),
      );
    });

    it('melempar NotFoundException bila prestasi tidak ada', async () => {
      prisma.client.achievement.findUnique.mockResolvedValue(null);

      await expect(service.delete('ach-none')).rejects.toThrow(NotFoundException);
    });
  });
});

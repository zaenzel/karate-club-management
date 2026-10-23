import { ConflictException, NotFoundException } from '@nestjs/common';
import { MemberType } from '@karate/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BranchesService } from './branches.service.js';

describe('BranchesService', () => {
  let service: BranchesService;
  let mockPrisma: any;
  let mockAudit: any;

  const mockBranch = {
    id: 'branch-1',
    code: 'JKT-01',
    name: 'Dojo Jakarta',
    city: 'Jakarta',
    address: 'Jl. Sudirman',
    phone: '0812345678',
    headCoachId: null,
    headCoach: null,
    _count: { members: 5, exams: 0 },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
  };

  beforeEach(() => {
    mockPrisma = {
      client: {
        branch: {
          findMany: vi.fn(),
          count: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        member: {
          findUnique: vi.fn(),
        },
        $transaction: vi.fn().mockImplementation((arg) => {
          if (Array.isArray(arg)) {
            return Promise.all(arg);
          }
          if (typeof arg === 'function') {
            return arg(mockPrisma.client);
          }
          return arg;
        }),
      },
    };

    mockAudit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    service = new BranchesService(mockPrisma, mockAudit);
  });

  describe('list', () => {
    it('returns paginated branches with search query', async () => {
      mockPrisma.client.branch.findMany.mockResolvedValue([mockBranch]);
      mockPrisma.client.branch.count.mockResolvedValue(1);

      const result = await service.list({ page: 1, pageSize: 10, q: 'jkt' });

      expect(mockPrisma.client.branch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { code: { contains: 'jkt', mode: 'insensitive' } },
              { name: { contains: 'jkt', mode: 'insensitive' } },
              { city: { contains: 'jkt', mode: 'insensitive' } },
            ],
          },
          skip: 0,
          take: 10,
          orderBy: { name: 'asc' },
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].code).toBe('JKT-01');
      expect(result.data[0].memberCount).toBe(5);
      expect(result.meta).toEqual({
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('options', () => {
    it('returns simplified options list', async () => {
      const options = [{ id: 'branch-1', code: 'JKT-01', name: 'Dojo Jakarta' }];
      mockPrisma.client.branch.findMany.mockResolvedValue(options);

      const result = await service.options();

      expect(mockPrisma.client.branch.findMany).toHaveBeenCalledWith({
        select: { id: true, code: true, name: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(options);
    });
  });

  describe('findById', () => {
    it('returns branch when found', async () => {
      mockPrisma.client.branch.findUnique.mockResolvedValue(mockBranch);

      const result = await service.findById('branch-1');

      expect(result.id).toBe('branch-1');
      expect(result.name).toBe('Dojo Jakarta');
    });

    it('throws NotFoundException when branch not found', async () => {
      mockPrisma.client.branch.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates branch and logs audit', async () => {
      mockPrisma.client.branch.create.mockResolvedValue(mockBranch);

      const result = await service.create(
        {
          code: 'JKT-01',
          name: 'Dojo Jakarta',
          city: 'Jakarta',
          address: 'Jl. Sudirman',
          phone: '0812345678',
          headCoachId: null,
        },
        { id: 'user-1', name: 'Admin', email: 'admin@karate.local', role: 'SUPERADMIN' },
      );

      expect(mockPrisma.client.branch.create).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          action: 'branch.create',
          entity: 'Branch',
          entityId: 'branch-1',
        }),
        expect.anything(),
      );
      expect(result.id).toBe('branch-1');
    });

    it('throws ConflictException if headCoachId is not a COACH', async () => {
      mockPrisma.client.member.findUnique.mockResolvedValue({
        id: 'member-1',
        type: MemberType.STUDENT,
      });

      await expect(
        service.create({
          code: 'JKT-01',
          name: 'Dojo Jakarta',
          city: 'Jakarta',
          address: null,
          phone: null,
          headCoachId: 'member-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('allows create if headCoachId is a COACH', async () => {
      mockPrisma.client.member.findUnique.mockResolvedValue({
        id: 'member-1',
        type: MemberType.COACH,
      });
      mockPrisma.client.branch.create.mockResolvedValue({
        ...mockBranch,
        headCoachId: 'member-1',
        headCoach: { id: 'member-1', name: 'Sensei Bob' },
      });

      const result = await service.create({
        code: 'JKT-01',
        name: 'Dojo Jakarta',
        city: 'Jakarta',
        address: null,
        phone: null,
        headCoachId: 'member-1',
      });

      expect(result.headCoach).toEqual({ id: 'member-1', name: 'Sensei Bob' });
    });
  });

  describe('update', () => {
    it('updates branch and logs audit', async () => {
      mockPrisma.client.branch.findUnique.mockResolvedValue(mockBranch);
      mockPrisma.client.branch.update.mockResolvedValue({
        ...mockBranch,
        name: 'Dojo Jakarta Selatan',
      });

      const result = await service.update(
        'branch-1',
        { name: 'Dojo Jakarta Selatan' },
        { id: 'user-1', name: 'Admin', email: 'admin@karate.local', role: 'SUPERADMIN' },
      );

      expect(mockPrisma.client.branch.update).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          action: 'branch.update',
          entity: 'Branch',
          entityId: 'branch-1',
        }),
        expect.anything(),
      );
      expect(result.name).toBe('Dojo Jakarta Selatan');
    });

    it('throws NotFoundException if branch to update does not exist', async () => {
      mockPrisma.client.branch.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException if updated headCoachId is not a COACH', async () => {
      mockPrisma.client.branch.findUnique.mockResolvedValue(mockBranch);
      mockPrisma.client.member.findUnique.mockResolvedValue({
        id: 'member-1',
        type: MemberType.STUDENT,
      });

      await expect(service.update('branch-1', { headCoachId: 'member-1' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('delete', () => {
    it('throws NotFoundException if branch does not exist', async () => {
      mockPrisma.client.branch.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if branch still has members', async () => {
      mockPrisma.client.branch.findUnique.mockResolvedValue({
        ...mockBranch,
        _count: { members: 3, exams: 0 },
      });

      await expect(service.delete('branch-1')).rejects.toThrow(
        new ConflictException('Cabang masih dipakai oleh member atau ujian'),
      );
    });

    it('throws ConflictException if branch still has exams', async () => {
      mockPrisma.client.branch.findUnique.mockResolvedValue({
        ...mockBranch,
        _count: { members: 0, exams: 1 },
      });

      await expect(service.delete('branch-1')).rejects.toThrow(
        new ConflictException('Cabang masih dipakai oleh member atau ujian'),
      );
    });

    it('deletes branch and logs audit when unused', async () => {
      mockPrisma.client.branch.findUnique.mockResolvedValue({
        ...mockBranch,
        _count: { members: 0, exams: 0 },
      });
      mockPrisma.client.branch.delete.mockResolvedValue(mockBranch);

      const result = await service.delete('branch-1', {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@karate.local',
        role: 'SUPERADMIN',
      });

      expect(mockPrisma.client.branch.delete).toHaveBeenCalledWith({ where: { id: 'branch-1' } });
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          action: 'branch.delete',
          entity: 'Branch',
          entityId: 'branch-1',
        }),
        expect.anything(),
      );
      expect(result).toEqual({ message: 'Cabang berhasil dihapus' });
    });
  });
});

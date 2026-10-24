import { ConflictException, NotFoundException } from '@nestjs/common';
import { GradeSource, MemberType } from '@karate/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MembersService } from './members.service.js';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: any;
  let audit: any;

  beforeEach(() => {
    prisma = {
      client: {
        $transaction: vi.fn((callbackOrArr) => {
          if (typeof callbackOrArr === 'function') {
            return callbackOrArr(prisma.client);
          }
          return Promise.all(callbackOrArr);
        }),
        branch: {
          findUnique: vi.fn(),
        },
        belt: {
          findUnique: vi.fn(),
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        member: {
          findFirst: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          count: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        gradeHistory: {
          create: vi.fn(),
          findMany: vi.fn(),
        },
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    service = new MembersService(prisma, audit);
  });

  describe('create', () => {
    it('membuat member default sabuk putih kyu 10 bila tanpa initialGrade', async () => {
      prisma.client.branch.findUnique.mockResolvedValue({
        id: 'branch-1',
        code: 'BDG-01',
        name: 'Dojo Bandung',
      });
      prisma.client.belt.findFirst.mockResolvedValue({
        id: 'belt-white',
        name: 'Putih',
        order: 1,
        colorHex: '#FFFFFF',
      });
      prisma.client.member.findFirst.mockResolvedValue(null); // next member number M202600001
      prisma.client.member.create.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: 'member-1',
          ...data,
          branch: { id: 'branch-1', code: 'BDG-01', name: 'Dojo Bandung' },
          belt: { id: 'belt-white', name: 'Putih', order: 1, colorHex: '#FFFFFF' },
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const result = await service.create({
        type: MemberType.STUDENT,
        name: 'Budi Santoso',
        birthPlace: 'Bandung',
        birthDate: '2012-05-01',
        address: 'Jl. Merdeka No. 1',
        branchId: 'branch-1',
      });

      expect(result.name).toBe('Budi Santoso');
      expect(result.memberNumber).toMatch(/^M\d{9}$/);
      expect(result.kyu).toBe(10);
      expect(result.dan).toBeNull();
      expect(prisma.client.gradeHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          source: GradeSource.INITIAL,
          memberId: 'member-1',
          toBeltId: 'belt-white',
          toDan: null,
        }),
      });
      expect(audit.log).toHaveBeenCalled();
    });

    it('membuat member dengan tingkatan awal yang valid', async () => {
      prisma.client.branch.findUnique.mockResolvedValue({ id: 'branch-1' });
      prisma.client.belt.findUnique.mockResolvedValue({
        id: 'belt-blue',
        name: 'Biru',
        order: 4,
        colorHex: '#2563EB',
      });
      prisma.client.member.findFirst.mockResolvedValue({ memberNumber: 'M202600005' });
      prisma.client.member.create.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: 'member-2',
          ...data,
          branch: { id: 'branch-1', code: 'BDG-01', name: 'Dojo Bandung' },
          belt: { id: 'belt-blue', name: 'Biru', order: 4, colorHex: '#2563EB' },
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const result = await service.create({
        type: MemberType.STUDENT,
        name: 'Siti Aminah',
        birthPlace: 'Jakarta',
        birthDate: '2010-08-15',
        address: 'Jl. Sudirman',
        branchId: 'branch-1',
        initialGrade: {
          beltId: 'belt-blue',
          kyu: 5,
        },
      });

      expect(result.kyu).toBe(5);
      expect(result.memberNumber).toBe('M202600006');
    });

    it('menolak tingkatan awal yang melanggar aturan (misal hitam kyu 2)', async () => {
      prisma.client.branch.findUnique.mockResolvedValue({ id: 'branch-1' });
      prisma.client.belt.findUnique.mockResolvedValue({
        id: 'belt-black',
        name: 'Hitam',
        order: 6,
        colorHex: '#111111',
      });

      await expect(
        service.create({
          type: MemberType.COACH,
          name: 'Sensei Joko',
          birthPlace: 'Surabaya',
          birthDate: '1985-01-01',
          address: 'Jl. Pemuda',
          branchId: 'branch-1',
          initialGrade: {
            beltId: 'belt-black',
            kyu: 2,
            dan: 1,
          },
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('menolak bila cabang tidak ditemukan', async () => {
      prisma.client.branch.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          type: MemberType.STUDENT,
          name: 'Murid Baru',
          birthPlace: 'Semarang',
          birthDate: '2015-02-02',
          address: 'Jl. Pahlawan',
          branchId: 'branch-unknown',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('menolak penghapusan jika member memiliki riwayat ujian', async () => {
      prisma.client.member.findUnique.mockResolvedValue({
        id: 'm-1',
        _count: { examParticipants: 1, certificates: 0, headOfBranch: 0 },
      });

      await expect(service.delete('m-1')).rejects.toThrow(ConflictException);
    });

    it('menolak penghapusan jika member menjabat sebagai kepala cabang', async () => {
      prisma.client.member.findUnique.mockResolvedValue({
        id: 'm-coach',
        _count: { examParticipants: 0, certificates: 0, headOfBranch: 1 },
      });

      await expect(service.delete('m-coach')).rejects.toThrow(ConflictException);
    });

    it('berhasil menghapus jika tidak memiliki ujian/sertifikat/kepala cabang', async () => {
      prisma.client.member.findUnique.mockResolvedValue({
        id: 'm-fresh',
        _count: { examParticipants: 0, certificates: 0, headOfBranch: 0 },
      });
      prisma.client.member.delete.mockResolvedValue({ id: 'm-fresh' });

      const res = await service.delete('m-fresh');
      expect(res.message).toBe('Member berhasil dihapus');
      expect(prisma.client.member.delete).toHaveBeenCalledWith({ where: { id: 'm-fresh' } });
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'member.delete', entityId: 'm-fresh' }),
        expect.anything(),
      );
    });
  });
});

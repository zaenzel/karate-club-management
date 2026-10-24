import { ConflictException } from '@nestjs/common';
import { ExamResult, ExamStatus, ExamType, GradeSource, PaymentStatus, Prisma } from '@karate/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ExamsService } from './exams.service.js';

describe('ExamsService', () => {
  let service: ExamsService;
  let prisma: any;
  let audit: any;
  let mockHandler: any;

  const mockBelts = [
    { id: 'belt-1', name: 'Putih', order: 1, colorHex: '#ffffff' },
    { id: 'belt-2', name: 'Kuning', order: 2, colorHex: '#ffff00' },
    { id: 'belt-3', name: 'Hijau', order: 3, colorHex: '#00ff00' },
    { id: 'belt-4', name: 'Biru', order: 4, colorHex: '#0000ff' },
    { id: 'belt-5', name: 'Cokelat', order: 5, colorHex: '#8b4513' },
    { id: 'belt-6', name: 'Hitam', order: 6, colorHex: '#000000' },
  ];

  beforeEach(() => {
    prisma = {
      client: {
        $transaction: vi.fn((callbackOrArr) => {
          if (typeof callbackOrArr === 'function') {
            return callbackOrArr(prisma.client);
          }
          return Promise.all(callbackOrArr);
        }),
        exam: {
          findUnique: vi.fn(),
          findMany: vi.fn(),
          count: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        examExaminer: {
          createMany: vi.fn(),
          deleteMany: vi.fn(),
        },
        examParticipant: {
          findUnique: vi.fn(),
          findMany: vi.fn(),
          createMany: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        branch: {
          findUnique: vi.fn(),
        },
        belt: {
          findMany: vi.fn().mockResolvedValue(mockBelts),
        },
        member: {
          findUnique: vi.fn(),
          findMany: vi.fn(),
          update: vi.fn(),
        },
        gradeHistory: {
          create: vi.fn(),
        },
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    mockHandler = {
      handle: vi.fn().mockResolvedValue(undefined),
    };

    service = new ExamsService(prisma, audit, [mockHandler]);
  });

  describe('create & update & delete (TKT-011)', () => {
    it('create selalu DRAFT dan validasi cabang jika ada', async () => {
      prisma.client.branch.findUnique.mockResolvedValue({ id: 'branch-1', name: 'Dojo A' });
      prisma.client.exam.create.mockResolvedValue({
        id: 'exam-1',
        name: 'Ujian Kyu Semester 1',
        type: ExamType.KYU,
        date: new Date('2026-11-01T00:00:00.000Z'),
        location: 'GOR Dojo A',
        baseFee: 150000,
        status: ExamStatus.DRAFT,
        branchId: 'branch-1',
        branch: { id: 'branch-1', name: 'Dojo A' },
        examiners: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await service.create({
        name: 'Ujian Kyu Semester 1',
        type: ExamType.KYU,
        date: '2026-11-01',
        location: 'GOR Dojo A',
        baseFee: 150000,
        branchId: 'branch-1',
      });

      expect(res.status).toBe(ExamStatus.DRAFT);
      expect(prisma.client.exam.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ExamStatus.DRAFT,
            baseFee: 150000,
          }),
        }),
      );
    });

    it('update menolak 409 jika status FINISHED', async () => {
      prisma.client.exam.findUnique.mockResolvedValue({
        id: 'exam-1',
        status: ExamStatus.FINISHED,
        _count: { participants: 2 },
      });

      await expect(
        service.update('exam-1', { name: 'Ganti Nama' }),
      ).rejects.toThrow(ConflictException);
    });

    it('update menolak mengubah tipe jika sudah ada peserta', async () => {
      prisma.client.exam.findUnique.mockResolvedValue({
        id: 'exam-1',
        type: ExamType.KYU,
        status: ExamStatus.DRAFT,
        _count: { participants: 5 },
      });

      await expect(
        service.update('exam-1', { type: ExamType.DAN }),
      ).rejects.toThrow(ConflictException);
    });

    it('delete menolak jika status ONGOING atau FINISHED', async () => {
      prisma.client.exam.findUnique.mockResolvedValue({
        id: 'exam-1',
        status: ExamStatus.ONGOING,
      });

      await expect(service.delete('exam-1')).rejects.toThrow(ConflictException);
    });

    it('start menolak jika status bukan DRAFT atau kurang penguji/peserta', async () => {
      prisma.client.exam.findUnique.mockResolvedValue({
        id: 'exam-1',
        status: ExamStatus.DRAFT,
        _count: { examiners: 0, participants: 0 },
      });

      await expect(service.start('exam-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('participants & results (TKT-012)', () => {
    it('addParticipants memfilter member tidak sah dan mendaftarkan yang valid', async () => {
      prisma.client.exam.findUnique.mockResolvedValue({
        id: 'exam-1',
        type: ExamType.KYU,
        status: ExamStatus.DRAFT,
        baseFee: 100000,
      });

      prisma.client.member.findMany.mockResolvedValue([
        {
          id: 'mem-1',
          name: 'Budi (Kyu)',
          beltId: 'belt-1',
          belt: { id: 'belt-1', order: 1 },
          kyu: new Prisma.Decimal(10),
          dan: null,
          examParticipants: [],
        },
        {
          id: 'mem-2',
          name: 'Sensei (Hitam)',
          beltId: 'belt-6',
          belt: { id: 'belt-6', order: 6 },
          kyu: new Prisma.Decimal(0),
          dan: 2,
          examParticipants: [],
        },
      ]);

      const res = await service.addParticipants('exam-1', {
        memberIds: ['mem-1', 'mem-2'],
      });

      expect(res.addedCount).toBe(1);
      expect(res.rejected).toHaveLength(1);
      expect(res.rejected[0]?.memberId).toBe('mem-2');
      expect(prisma.client.examParticipant.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            memberId: 'mem-1',
            fee: 100000,
            paymentStatus: PaymentStatus.UNPAID,
          }),
        ],
      });
    });

    it('updateResult FAILED mengosongkan kyuDecrease, danIncrease, dan toBeltId', async () => {
      prisma.client.examParticipant.findUnique.mockResolvedValue({
        id: 'part-1',
        examId: 'exam-1',
        fromBeltId: 'belt-1',
        fromKyu: new Prisma.Decimal(10),
        fromDan: null,
        result: ExamResult.PASSED,
        kyuDecrease: new Prisma.Decimal(1),
        toBeltId: 'belt-2',
        exam: { id: 'exam-1', type: ExamType.KYU, status: ExamStatus.ONGOING },
        fromBelt: { id: 'belt-1', order: 1 },
      });

      await service.updateResult('exam-1', 'part-1', {
        result: ExamResult.FAILED,
      });

      expect(prisma.client.examParticipant.update).toHaveBeenCalledWith({
        where: { id: 'part-1' },
        data: {
          result: ExamResult.FAILED,
          kyuDecrease: null,
          danIncrease: null,
          toBeltId: null,
        },
      });
    });

    it('updateResult PASSED menolak jika aturan tingkatan tidak valid', async () => {
      prisma.client.examParticipant.findUnique.mockResolvedValue({
        id: 'part-1',
        examId: 'exam-1',
        fromBeltId: 'belt-4', // biru
        fromKyu: new Prisma.Decimal(5),
        fromDan: null,
        exam: { id: 'exam-1', type: ExamType.KYU, status: ExamStatus.ONGOING },
        fromBelt: { id: 'belt-4', order: 4 },
      });

      // Mencoba menurunkan warna sabuk dari biru (4) ke hijau (3)
      await expect(
        service.updateResult('exam-1', 'part-1', {
          result: ExamResult.PASSED,
          toBeltId: 'belt-3', // hijau
          kyuDecrease: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('finish (TKT-013)', () => {
    it('finish menolak jika masih ada peserta tanpa hasil', async () => {
      prisma.client.exam.findUnique.mockResolvedValue({
        id: 'exam-1',
        status: ExamStatus.ONGOING,
        participants: [
          {
            id: 'part-1',
            result: ExamResult.PASSED,
            member: { name: 'Member A' },
          },
          {
            id: 'part-2',
            result: null, // belum dinilai
            member: { name: 'Member B' },
          },
        ],
      });

      await expect(service.finish('exam-1')).rejects.toThrow(ConflictException);
    });

    it('finish atomik memperbarui member, mencatat GradeHistory, dan memanggil handler', async () => {
      const examDate = new Date('2026-11-15T00:00:00.000Z');
      prisma.client.exam.findUnique
        .mockResolvedValueOnce({
          id: 'exam-1',
          name: 'Ujian Akhir',
          type: ExamType.KYU,
          date: examDate,
          status: ExamStatus.ONGOING,
          participants: [
            {
              id: 'part-1',
              memberId: 'mem-1',
              fromBeltId: 'belt-1',
              fromKyu: new Prisma.Decimal(10),
              fromDan: null,
              result: ExamResult.PASSED,
              kyuDecrease: new Prisma.Decimal(1),
              danIncrease: null,
              toBeltId: 'belt-2',
              member: {
                id: 'mem-1',
                name: 'Budi',
                beltId: 'belt-1',
                kyu: new Prisma.Decimal(10),
                dan: null,
              },
              fromBelt: { id: 'belt-1', order: 1 },
              toBelt: { id: 'belt-2', order: 2 },
            },
            {
              id: 'part-2',
              memberId: 'mem-2',
              fromBeltId: 'belt-1',
              fromKyu: new Prisma.Decimal(10),
              fromDan: null,
              result: ExamResult.FAILED,
              kyuDecrease: null,
              danIncrease: null,
              toBeltId: null,
              member: {
                id: 'mem-2',
                name: 'Andi',
                beltId: 'belt-1',
                kyu: new Prisma.Decimal(10),
                dan: null,
              },
              fromBelt: { id: 'belt-1', order: 1 },
              toBelt: null,
            },
          ],
        })
        .mockResolvedValueOnce({
          status: ExamStatus.ONGOING,
        })
        // Mock findById return at end
        .mockResolvedValueOnce({
          id: 'exam-1',
          name: 'Ujian Akhir',
          type: ExamType.KYU,
          date: examDate,
          status: ExamStatus.FINISHED,
          branch: null,
          examiners: [],
          participants: [
            { result: ExamResult.PASSED },
            { result: ExamResult.FAILED },
          ],
        });

      prisma.client.member.findUnique.mockResolvedValue({
        id: 'mem-1',
        name: 'Budi',
        beltId: 'belt-1',
        kyu: new Prisma.Decimal(10),
        dan: null,
      });

      await service.finish('exam-1');

      // GradeHistory dicatat untuk part-1 (PASSED)
      expect(prisma.client.gradeHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memberId: 'mem-1',
          source: GradeSource.EXAM,
          examParticipantId: 'part-1',
          fromBeltId: 'belt-1',
          toBeltId: 'belt-2',
          toKyu: expect.any(Prisma.Decimal),
        }),
      });

      // Member mem-1 diupdate
      expect(prisma.client.member.update).toHaveBeenCalledWith({
        where: { id: 'mem-1' },
        data: expect.objectContaining({
          beltId: 'belt-2',
          kyu: expect.any(Prisma.Decimal),
          dan: null,
        }),
      });

      // Status ujian diubah menjadi FINISHED
      expect(prisma.client.exam.update).toHaveBeenCalledWith({
        where: { id: 'exam-1' },
        data: { status: ExamStatus.FINISHED },
      });

      // Handler dipanggil dengan id lulus
      expect(mockHandler.handle).toHaveBeenCalledWith(
        expect.anything(),
        'exam-1',
        ['part-1'],
      );
    });
  });
});

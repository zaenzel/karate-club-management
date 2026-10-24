import { describe, expect, it, vi } from 'vitest';

import { BeltsService } from './belts.service.js';

describe('BeltsService', () => {
  it('mengembalikan daftar sabuk terurut berdasarkan order', async () => {
    const mockBelts = [
      { id: '1', name: 'Putih', order: 1, colorHex: '#FFFFFF' },
      { id: '2', name: 'Kuning', order: 2, colorHex: '#FACC15' },
    ];
    const prisma = {
      client: {
        belt: {
          findMany: vi.fn().mockResolvedValue(mockBelts),
        },
      },
    };

    const service = new BeltsService(prisma as any);
    const result = await service.list();

    expect(result).toEqual(mockBelts);
    expect(prisma.client.belt.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        order: true,
        colorHex: true,
      },
      orderBy: { order: 'asc' },
    });
  });
});

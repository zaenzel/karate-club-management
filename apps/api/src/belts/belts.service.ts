import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

export type BeltResponse = {
  id: string;
  name: string;
  order: number;
  colorHex: string;
};

@Injectable()
export class BeltsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<BeltResponse[]> {
    return this.prisma.client.belt.findMany({
      select: {
        id: true,
        name: true,
        order: true,
        colorHex: true,
      },
      orderBy: { order: 'asc' },
    });
  }
}

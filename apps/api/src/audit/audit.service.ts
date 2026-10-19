import { Injectable } from '@nestjs/common';
import type { Prisma } from '@karate/db';

import { PrismaService } from '../prisma/prisma.service.js';

export type AuditEntry = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Catat aksi penting. Berikan `tx` agar ikut transaksi pemanggil. */
  async log(entry: AuditEntry, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma.client;
    await client.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        before: entry.before,
        after: entry.after,
      },
    });
  }
}

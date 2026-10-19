import type { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';

describe('AuditService', () => {
  const entry = { userId: 'u1', action: 'create', entity: 'Branch', entityId: 'b1' };

  it('menulis ke client default', async () => {
    const create = vi.fn();
    const service = new AuditService({
      client: { auditLog: { create } },
    } as unknown as PrismaService);
    await service.log({ ...entry, after: { name: 'Pusat' } });
    expect(create).toHaveBeenCalledWith({
      data: { ...entry, before: undefined, after: { name: 'Pusat' } },
    });
  });

  it('ikut transaksi bila tx diberikan', async () => {
    const create = vi.fn();
    const clientCreate = vi.fn();
    const service = new AuditService({
      client: { auditLog: { create: clientCreate } },
    } as unknown as PrismaService);
    await service.log(entry, { auditLog: { create } } as never);
    expect(create).toHaveBeenCalledOnce();
    expect(clientCreate).not.toHaveBeenCalled();
  });

  it('userId kosong disimpan sebagai null', async () => {
    const create = vi.fn();
    const service = new AuditService({
      client: { auditLog: { create } },
    } as unknown as PrismaService);
    await service.log({ action: 'x', entity: 'Y', entityId: '1' });
    expect(create.mock.calls[0]?.[0].data.userId).toBeNull();
  });
});

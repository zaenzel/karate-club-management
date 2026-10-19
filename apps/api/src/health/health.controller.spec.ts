import { ServiceUnavailableException } from '@nestjs/common';

import type { PrismaService } from '../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

function controller(queryRaw: () => Promise<unknown>) {
  return new HealthController({ client: { $queryRaw: queryRaw } } as unknown as PrismaService);
}

describe('HealthController', () => {
  it('melaporkan ok bila database menjawab', async () => {
    await expect(controller(async () => [{ '?column?': 1 }]).check()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
  });

  it('melempar 503 bila database mati', async () => {
    const down = controller(async () => {
      throw new Error('koneksi putus');
    });
    await expect(down.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

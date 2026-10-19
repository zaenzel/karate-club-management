import type { ArgumentsHost } from '@nestjs/common';
import { Prisma } from '@karate/db';

import { PrismaExceptionFilter } from './prisma-exception.filter.js';

function run(code: string, meta?: Record<string, unknown>) {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  const error = new Prisma.PrismaClientKnownRequestError('x', { code, clientVersion: '7', meta });
  new PrismaExceptionFilter().catch(error, host);
  return { status, json };
}

describe('PrismaExceptionFilter', () => {
  it('P2002 menjadi 409 dan menyebut field', () => {
    const { status, json } = run('P2002', { target: ['email'] });
    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'Data dengan email yang sama sudah ada',
    });
  });

  it('P2002 dari driver adapter memakai constraint.fields', () => {
    const { json } = run('P2002', {
      driverAdapterError: { cause: { constraint: { fields: ['code'] } } },
    });
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Data dengan code yang sama sudah ada' }),
    );
  });

  it('P2025 menjadi 404', () => {
    const { status, json } = run('P2025');
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ statusCode: 404, message: 'Data tidak ditemukan' });
  });
});

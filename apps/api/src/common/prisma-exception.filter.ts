import { type ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@karate/db';
import type { Response } from 'express';

/** Field yang melanggar unique. Bentuk meta berbeda antara engine bawaan dan driver adapter. */
function uniqueFields(error: Prisma.PrismaClientKnownRequestError): string[] {
  const meta = error.meta as
    | { target?: unknown; driverAdapterError?: { cause?: { constraint?: { fields?: unknown } } } }
    | undefined;
  const raw = meta?.target ?? meta?.driverAdapterError?.cause?.constraint?.fields;
  return Array.isArray(raw) ? raw.map(String) : [];
}

/** Ubah error Prisma yang umum menjadi respons HTTP berpesan Indonesia. Kode lain diteruskan ke handler bawaan Nest. */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  override catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (error.code === 'P2002') {
      const fields = uniqueFields(error);
      const message = fields.length
        ? `Data dengan ${fields.join(', ')} yang sama sudah ada`
        : 'Data yang sama sudah ada';
      response.status(HttpStatus.CONFLICT).json({ statusCode: 409, message });
      return;
    }
    if (error.code === 'P2025') {
      response
        .status(HttpStatus.NOT_FOUND)
        .json({ statusCode: 404, message: 'Data tidak ditemukan' });
      return;
    }
    super.catch(error, host);
  }
}

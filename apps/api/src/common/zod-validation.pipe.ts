import { BadRequestException, type PipeTransform } from '@nestjs/common';
import { z } from 'zod';

/** Validasi body/query/param dengan schema Zod. Mengembalikan data hasil parse (sudah di-coerce). */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Data tidak valid',
        errors: z.flattenError(result.error).fieldErrors,
      });
    }
    return result.data;
  }
}

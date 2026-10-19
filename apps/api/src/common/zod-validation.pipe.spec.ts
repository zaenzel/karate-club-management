import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

import { paginationQuerySchema } from './pagination.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(z.object({ name: z.string().min(1) }));

  it('mengembalikan data yang valid', () => {
    expect(pipe.transform({ name: 'Budi' })).toEqual({ name: 'Budi' });
  });

  it('melempar 400 dengan detail per field bila tidak valid', () => {
    try {
      pipe.transform({ name: '' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const body = (error as BadRequestException).getResponse();
      expect(body).toMatchObject({
        message: 'Data tidak valid',
        errors: { name: [expect.any(String)] },
      });
    }
  });

  it('mengubah query string menjadi number', () => {
    const result = new ZodValidationPipe(paginationQuerySchema).transform({ page: '2' });
    expect(result).toEqual({ page: 2, pageSize: 20 });
  });
});

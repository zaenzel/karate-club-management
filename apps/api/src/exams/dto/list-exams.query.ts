import { ExamStatus, ExamType } from '@karate/db';
import { z } from 'zod';

import { paginationQuerySchema } from '../../common/pagination.js';

export const listExamsSchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  status: z.nativeEnum(ExamStatus).optional(),
  type: z.nativeEnum(ExamType).optional(),
  branchId: z.string().uuid().optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format dateFrom harus YYYY-MM-DD')
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format dateTo harus YYYY-MM-DD')
    .optional(),
});

export type ListExamsQuery = z.infer<typeof listExamsSchema>;

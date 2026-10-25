import { z } from 'zod';
import { paginationQuerySchema } from '../../common/pagination.js';

export const listCertificatesSchema = paginationQuerySchema.extend({
  examId: z.string().optional(),
  memberId: z.string().optional(),
  status: z.enum(['PENDING', 'READY', 'FAILED']).optional(),
  isActive: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean())
    .optional(),
  q: z.string().optional(),
});

export type ListCertificatesQuery = z.infer<typeof listCertificatesSchema>;

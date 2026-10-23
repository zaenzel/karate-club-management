import { z } from 'zod';
import { paginationQuerySchema } from '../../common/pagination.js';

export const listBranchesSchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
});

export type ListBranchesQuery = z.infer<typeof listBranchesSchema>;

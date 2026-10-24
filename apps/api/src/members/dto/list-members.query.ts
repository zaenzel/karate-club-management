import { MemberType } from '@karate/db';
import { z } from 'zod';

import { paginationQuerySchema } from '../../common/pagination.js';

export const listMembersSchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  branchId: z.string().uuid().optional(),
  type: z.nativeEnum(MemberType).optional(),
  beltId: z.string().uuid().optional(),
});

export type ListMembersQuery = z.infer<typeof listMembersSchema>;

import { z } from 'zod';
import { createBranchSchema } from './create-branch.dto.js';

export const updateBranchSchema = createBranchSchema.partial();

export type UpdateBranchDto = z.infer<typeof updateBranchSchema>;

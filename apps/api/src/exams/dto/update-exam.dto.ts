import { createExamSchema } from './create-exam.dto.js';
import type { z } from 'zod';

export const updateExamSchema = createExamSchema.partial();

export type UpdateExamDto = z.infer<typeof updateExamSchema>;

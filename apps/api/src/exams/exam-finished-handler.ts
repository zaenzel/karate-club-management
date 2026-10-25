import type { Prisma } from '@karate/db';

export const EXAM_FINISHED_HANDLERS = 'EXAM_FINISHED_HANDLERS';

export interface ExamFinishedHandler {
  handle(
    tx: Prisma.TransactionClient,
    examId: string,
    passedParticipantIds: string[],
  ): Promise<void>;
  afterCommit?(examId: string): Promise<void>;
}

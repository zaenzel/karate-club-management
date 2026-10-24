import type { ExamStatus } from '@karate/db';

export function canEdit(status: ExamStatus): boolean {
  return status === 'DRAFT' || status === 'ONGOING';
}

export function canDelete(status: ExamStatus): boolean {
  return status === 'DRAFT';
}

export function canStart(status: ExamStatus): boolean {
  return status === 'DRAFT';
}

export function canChangeType(status: ExamStatus, participantCount: number): boolean {
  return status === 'DRAFT' && participantCount === 0;
}

export function canFinish(status: ExamStatus): boolean {
  return status === 'ONGOING';
}

import type { ExamListParams } from '../types/exam';
import type { ParticipantListParams } from '../types/participant';

export const examKeys = {
  all: ['exams'] as const,
  lists: () => [...examKeys.all, 'list'] as const,
  list: (params: ExamListParams = {}) => [...examKeys.lists(), params] as const,
  details: () => [...examKeys.all, 'detail'] as const,
  detail: (id: string) => [...examKeys.details(), id] as const,
  participants: (examId: string, params: ParticipantListParams = {}) =>
    [...examKeys.detail(examId), 'participants', params] as const,
  eligibleMembers: (examId: string, q?: string, branchId?: string) =>
    [...examKeys.detail(examId), 'eligible-members', { q, branchId }] as const,
  branchOptions: () => ['exam-branch-options'] as const,
  belts: () => ['belts'] as const,
};

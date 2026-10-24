import type { MemberListParams } from '../types/member';

export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (params: MemberListParams = {}) => [...memberKeys.lists(), params] as const,
  details: () => [...memberKeys.all, 'detail'] as const,
  detail: (id: string) => [...memberKeys.details(), id] as const,
  gradeHistories: () => [...memberKeys.all, 'grade-history'] as const,
  gradeHistory: (id: string) => [...memberKeys.gradeHistories(), id] as const,
  achievements: (memberId: string) => [...memberKeys.detail(memberId), 'achievements'] as const,
  branchOptions: () => ['member-branch-options'] as const,
  belts: () => ['belts'] as const,
};

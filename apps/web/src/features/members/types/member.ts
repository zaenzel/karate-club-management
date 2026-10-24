export type MemberType = 'COACH' | 'STUDENT';

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  COACH: 'Coach',
  STUDENT: 'Murid',
} as const;

export type Belt = {
  id: string;
  name: string;
  order: number;
  colorHex: string;
};

export type BranchOption = {
  id: string;
  code: string;
  name: string;
};

export type Member = {
  id: string;
  memberNumber: string;
  type: MemberType;
  name: string;
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  address: string;
  phone: string | null;
  branch: {
    id: string;
    code: string;
    name: string;
  };
  belt: Belt;
  kyu: number;
  dan: number | null;
  createdAt: string;
  updatedAt: string;
};

export type GradeHistoryItem = {
  id: string;
  source: 'INITIAL' | 'EXAM';
  fromBelt: Belt | null;
  toBelt: Belt;
  fromKyu: number | null;
  toKyu: number;
  fromDan: number | null;
  toDan: number | null;
  occurredAt: string;
  exam: {
    id: string;
    name: string;
    date: string;
  } | null;
};

export type MemberListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  branchId?: string;
  type?: MemberType;
  beltId?: string;
};

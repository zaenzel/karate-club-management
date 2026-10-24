export type PaymentStatus = 'UNPAID' | 'PAID' | 'WAIVED';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'Belum bayar',
  PAID: 'Lunas',
  WAIVED: 'Dibebaskan',
};

export type ExamResult = 'PASSED' | 'FAILED';

export const EXAM_RESULT_LABELS: Record<ExamResult, string> = {
  PASSED: 'Lulus',
  FAILED: 'Tidak lulus',
};

export interface ExamBeltInfo {
  id: string;
  name: string;
  order: number;
  colorHex: string;
}

export interface ExamParticipant {
  id: string;
  examId: string;
  member: {
    id: string;
    memberNumber: string;
    name: string;
    branch: { id: string; name: string };
  };
  from: {
    belt: ExamBeltInfo;
    kyu: number;
    dan: number | null;
  };
  fee: number;
  paymentStatus: PaymentStatus;
  result: ExamResult | null;
  kyuDecrease: number | null;
  danIncrease: number | null;
  toBelt: ExamBeltInfo | null;
  preview: {
    belt: ExamBeltInfo;
    kyu: number;
    dan: number | null;
  } | null;
  createdAt: string;
}

export interface EligibleMember {
  id: string;
  memberNumber: string;
  name: string;
  branch: { id: string; name: string };
  belt: ExamBeltInfo;
  kyu: number;
  dan: number | null;
}

export interface AddParticipantsResult {
  addedCount: number;
  rejected: Array<{
    memberId: string;
    name: string;
    reason: string;
  }>;
}

export interface ParticipantListParams {
  branchId?: string;
  result?: ExamResult;
  paymentStatus?: PaymentStatus;
}

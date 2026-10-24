export type ExamType = 'KYU' | 'DAN';

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  KYU: 'Ujian kyu',
  DAN: 'Ujian dan',
};

export type ExamStatus = 'DRAFT' | 'ONGOING' | 'FINISHED';

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  DRAFT: 'Draf',
  ONGOING: 'Berlangsung',
  FINISHED: 'Selesai',
};

export interface ExamExaminer {
  id: string;
  name: string;
  isChief: boolean;
}

export interface ExamStats {
  participants: number;
  passed: number;
  failed: number;
  pending: number;
}

export interface Exam {
  id: string;
  name: string;
  type: ExamType;
  date: string;
  location: string;
  baseFee: number;
  status: ExamStatus;
  branch: { id: string; name: string } | null;
  examiners: ExamExaminer[];
  stats: ExamStats;
  createdAt: string;
  updatedAt: string;
}

export interface ExamListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: ExamStatus;
  type?: ExamType;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function canEditExam(status: ExamStatus): boolean {
  return status === 'DRAFT' || status === 'ONGOING';
}

export function canDeleteExam(status: ExamStatus): boolean {
  return status === 'DRAFT';
}

export function canStartExam(status: ExamStatus): boolean {
  return status === 'DRAFT';
}

export function canFinishExam(status: ExamStatus): boolean {
  return status === 'ONGOING';
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatExamDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return dateStr;
  }
}

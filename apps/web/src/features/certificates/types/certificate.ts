export type CertificateStatus = 'PENDING' | 'READY' | 'FAILED';

export interface CertificateListItem {
  id: string;
  number: string;
  status: CertificateStatus;
  isActive: boolean;
  issuedAt: string;
  member: {
    id: string;
    memberNumber: string;
    name: string;
  };
  exam: {
    id: string;
    name: string;
    type: string;
    date: string;
  };
  grade: {
    belt: string;
    kyu: number | null;
    dan: number | null;
  };
  hasPdf: boolean;
  hasPng: boolean;
}

export interface CertificateListParams {
  page?: number;
  pageSize?: number;
  examId?: string;
  memberId?: string;
  status?: CertificateStatus;
  isActive?: boolean;
  q?: string;
}

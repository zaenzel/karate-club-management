export interface FieldCoord {
  x: number;
  y: number;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number;
}

export interface FieldLayout {
  name?: FieldCoord;
  birth?: FieldCoord;
  branch?: FieldCoord;
  examDate?: FieldCoord;
  examLocation?: FieldCoord;
  grade?: FieldCoord;
  number?: FieldCoord;
  signature?: { x: number; y: number; width?: number; height?: number };
}

export interface CertificateTemplate {
  id: string;
  name: string;
  signerName: string;
  signerTitle: string;
  paperSize: string;
  fieldLayout: FieldLayout | null;
  isActive: boolean;
  hasSignature: boolean;
  createdAt: string;
  certificatesCount: number;
}

export interface CreateCertificateTemplatePayload {
  name: string;
  signerName: string;
  signerTitle?: string;
  design: File;
  signature?: File | null;
  fieldLayout?: FieldLayout | null;
}

export interface UpdateCertificateTemplatePayload {
  id: string;
  name?: string;
  signerName?: string;
  signerTitle?: string;
  design?: File | null;
  signature?: File | null;
  fieldLayout?: FieldLayout | null;
}

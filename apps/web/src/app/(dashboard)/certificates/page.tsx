import type { Metadata } from 'next';
import { CertificateListContainer } from '@/features/certificates';

export const metadata: Metadata = {
  title: 'Daftar Sertifikat | Karate Club',
  description: 'Kelola dan unduh sertifikat kenaikan sabuk karate',
};

export default function CertificatesPage() {
  return <CertificateListContainer />;
}

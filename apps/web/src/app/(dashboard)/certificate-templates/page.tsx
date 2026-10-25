import type { Metadata } from 'next';
import { CertificateTemplateListContainer } from '@/features/certificate-templates';

export const metadata: Metadata = {
  title: 'Template Sertifikat | Karate Club',
  description: 'Kelola template sertifikat ujian kenaikan tingkat karate',
};

export default function CertificateTemplatesPage() {
  return <CertificateTemplateListContainer />;
}

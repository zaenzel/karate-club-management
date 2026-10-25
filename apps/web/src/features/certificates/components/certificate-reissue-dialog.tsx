'use client';

import { ConfirmDialog } from '@/components/common/confirm-dialog';
import type { CertificateListItem } from '../types/certificate';

export interface CertificateReissueDialogProps {
  certificate: CertificateListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function CertificateReissueDialog({
  certificate,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CertificateReissueDialogProps) {
  if (!certificate) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Terbitkan Ulang Sertifikat"
      description={`Terbitkan ulang sertifikat untuk ${certificate.member.name}? Nomor sertifikat lama (${certificate.number}) akan dinonaktifkan secara permanen dan nomor baru dengan template aktif saat ini akan diterbitkan.`}
      confirmText="Terbitkan Ulang"
      variant="default"
      isLoading={isLoading}
    />
  );
}

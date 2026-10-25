import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExamCertificatesSection } from './exam-certificates-section';
import type { ExamCertificateItem } from '../api/get-exam-certificates';

describe('ExamCertificatesSection', () => {
  const mockCertificates: ExamCertificateItem[] = [
    {
      id: 'cert-1',
      number: 'C202600001',
      status: 'READY',
      isActive: true,
      issuedAt: '2026-10-24T00:00:00Z',
      member: {
        id: 'm-1',
        memberNumber: 'M001',
        name: 'Ahmad Dahlan',
      },
      grade: {
        belt: 'Kuning',
        kyu: 9,
        dan: null,
      },
      hasPdf: true,
      hasPng: true,
    },
  ];

  it('renders empty placeholder when no certificates', () => {
    const onBackfill = vi.fn().mockResolvedValue(undefined);
    const onDownload = vi.fn().mockResolvedValue(undefined);

    render(
      <ExamCertificatesSection certificates={[]} onBackfill={onBackfill} onDownload={onDownload} />,
    );

    expect(screen.getByText(/Belum ada sertifikat yang dibuat/i)).toBeInTheDocument();

    const backfillBtn = screen.getByRole('button', { name: /Buat Sertifikat yang Belum Ada/i });
    fireEvent.click(backfillBtn);
    expect(onBackfill).toHaveBeenCalledTimes(1);
  });

  it('renders table and triggers download', () => {
    const onBackfill = vi.fn().mockResolvedValue(undefined);
    const onDownload = vi.fn().mockResolvedValue(undefined);

    render(
      <ExamCertificatesSection
        certificates={mockCertificates}
        onBackfill={onBackfill}
        onDownload={onDownload}
      />,
    );

    expect(screen.getByText('C202600001')).toBeInTheDocument();
    expect(screen.getByText('Ahmad Dahlan')).toBeInTheDocument();

    const pdfBtn = screen.getByRole('button', { name: /pdf/i });
    fireEvent.click(pdfBtn);
    expect(onDownload).toHaveBeenCalledWith('cert-1', 'pdf');
  });
});

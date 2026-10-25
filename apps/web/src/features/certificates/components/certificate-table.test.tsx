import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CertificateTable } from './certificate-table';
import type { CertificateListItem } from '../types/certificate';

describe('CertificateTable', () => {
  const dummyCertificates: CertificateListItem[] = [
    {
      id: 'cert-1',
      number: 'C202600001',
      status: 'READY',
      isActive: true,
      issuedAt: '2026-10-24T00:00:00Z',
      member: {
        id: 'mem-1',
        memberNumber: 'M202600001',
        name: 'Budi Santoso',
      },
      exam: {
        id: 'exam-1',
        name: 'Ujian Kenaikan Kyu Okt 2026',
        type: 'KYU',
        date: '2026-10-24',
      },
      grade: {
        belt: 'Kuning',
        kyu: 9,
        dan: null,
      },
      hasPdf: true,
      hasPng: true,
    },
    {
      id: 'cert-2',
      number: 'C202600002',
      status: 'PENDING',
      isActive: true,
      issuedAt: '2026-10-24T00:00:00Z',
      member: {
        id: 'mem-2',
        memberNumber: 'M202600002',
        name: 'Siti Aminah',
      },
      exam: {
        id: 'exam-1',
        name: 'Ujian Kenaikan Kyu Okt 2026',
        type: 'KYU',
        date: '2026-10-24',
      },
      grade: {
        belt: 'Hijau',
        kyu: 7,
        dan: null,
      },
      hasPdf: false,
      hasPng: false,
    },
    {
      id: 'cert-3',
      number: 'C202600003',
      status: 'FAILED',
      isActive: true,
      issuedAt: '2026-10-24T00:00:00Z',
      member: {
        id: 'mem-3',
        memberNumber: 'M202600003',
        name: 'Ahmad Fauzi',
      },
      exam: {
        id: 'exam-1',
        name: 'Ujian Kenaikan Kyu Okt 2026',
        type: 'KYU',
        date: '2026-10-24',
      },
      grade: {
        belt: 'Biru',
        kyu: 5,
        dan: null,
      },
      hasPdf: false,
      hasPng: false,
    },
  ];

  it('menampilkan empty state jika sertifikat kosong', () => {
    render(
      <CertificateTable
        certificates={[]}
        onDownloadPdf={vi.fn()}
        onDownloadPng={vi.fn()}
        onReissue={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('Tidak Ada Sertifikat')).toBeInTheDocument();
  });

  it('menampilkan data sertifikat dan status badge dengan benar', () => {
    render(
      <CertificateTable
        certificates={dummyCertificates}
        onDownloadPdf={vi.fn()}
        onDownloadPng={vi.fn()}
        onReissue={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('C202600001')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('Siap')).toBeInTheDocument();
    expect(screen.getByText('Diproses')).toBeInTheDocument();
    expect(screen.getByText('Gagal')).toBeInTheDocument();
  });

  it('tombol download aktif hanya untuk status READY dan memanggil handler', () => {
    const onDownloadPdf = vi.fn();
    const onDownloadPng = vi.fn();

    render(
      <CertificateTable
        certificates={dummyCertificates}
        onDownloadPdf={onDownloadPdf}
        onDownloadPng={onDownloadPng}
        onReissue={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    const pdfButtons = screen.getAllByRole('button', { name: /PDF/i });
    expect(pdfButtons[0]).not.toBeDisabled();
    expect(pdfButtons[1]).toBeDisabled(); // PENDING disabled

    fireEvent.click(pdfButtons[0]!);
    expect(onDownloadPdf).toHaveBeenCalledWith(dummyCertificates[0]);

    const pngButtons = screen.getAllByRole('button', { name: /PNG/i });
    expect(pngButtons[0]).not.toBeDisabled();
    expect(pngButtons[1]).toBeDisabled(); // PENDING disabled

    fireEvent.click(pngButtons[0]!);
    expect(onDownloadPng).toHaveBeenCalledWith(dummyCertificates[0]);
  });

  it('tombol retry muncul untuk status FAILED dan memanggil handler', () => {
    const onRetry = vi.fn();

    render(
      <CertificateTable
        certificates={dummyCertificates}
        onDownloadPdf={vi.fn()}
        onDownloadPng={vi.fn()}
        onReissue={vi.fn()}
        onRetry={onRetry}
      />,
    );

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledWith(dummyCertificates[2]);
  });
});

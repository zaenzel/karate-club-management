import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemberCertificatesList } from './member-certificates-list';
import type { MemberCertificateItem } from '../api/get-member-certificates';
import * as memberCertApi from '../api/get-member-certificates';

vi.mock('../api/get-member-certificates', async () => {
  const actual = await vi.importActual<typeof memberCertApi>('../api/get-member-certificates');
  return {
    ...actual,
    downloadMemberCertificate: vi.fn().mockResolvedValue(undefined),
  };
});

describe('MemberCertificatesList', () => {
  const mockCertificates: MemberCertificateItem[] = [
    {
      id: 'cert-1',
      number: 'C202600001',
      status: 'READY',
      isActive: true,
      issuedAt: '2026-10-24T00:00:00Z',
      grade: {
        belt: 'Kuning',
        kyu: 9,
        dan: null,
      },
      exam: {
        id: 'exam-1',
        name: 'Ujian Kenaikan Kyu Okt 2026',
        date: '2026-10-24',
      },
      hasPdf: true,
      hasPng: true,
    },
    {
      id: 'cert-2',
      number: 'C202600002',
      status: 'PENDING',
      isActive: false,
      issuedAt: '2026-10-24T00:00:00Z',
      grade: {
        belt: 'Hijau',
        kyu: 7,
        dan: null,
      },
      exam: {
        id: 'exam-1',
        name: 'Ujian Kenaikan Kyu Okt 2026',
        date: '2026-10-24',
      },
      hasPdf: false,
      hasPng: false,
    },
  ];

  it('renders empty message when no certificates', () => {
    render(<MemberCertificatesList certificates={[]} />);
    expect(
      screen.getByText('Belum ada sertifikat kelulusan yang diterbitkan untuk member ini.'),
    ).toBeInTheDocument();
  });

  it('renders certificates table and triggers download', async () => {
    render(<MemberCertificatesList certificates={mockCertificates} />);

    expect(screen.getByText('C202600001')).toBeInTheDocument();
    expect(screen.getByText('Dicabut')).toBeInTheDocument();
    expect(screen.getByText('Siap')).toBeInTheDocument();
    expect(screen.getByText('Memproses')).toBeInTheDocument();

    const pdfBtn = screen.getByRole('button', { name: /pdf/i });
    fireEvent.click(pdfBtn);

    expect(memberCertApi.downloadMemberCertificate).toHaveBeenCalledWith('cert-1', 'pdf');
  });
});

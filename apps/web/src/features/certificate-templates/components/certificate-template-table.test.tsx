import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CertificateTemplateTable } from './certificate-template-table';
import type { CertificateTemplate } from '../types/template';

describe('CertificateTemplateTable', () => {
  const dummyTemplates: CertificateTemplate[] = [
    {
      id: 'tmpl-1',
      name: 'Template Desain Utama',
      signerName: 'Sensei Yudi',
      signerTitle: 'Ketua',
      paperSize: 'A4',
      fieldLayout: null,
      isActive: true,
      hasSignature: true,
      createdAt: '2026-03-01T00:00:00Z',
      certificatesCount: 10,
    },
    {
      id: 'tmpl-2',
      name: 'Template Desain Cadangan',
      signerName: 'Sensei Yudi',
      signerTitle: 'Ketua',
      paperSize: 'A4',
      fieldLayout: null,
      isActive: false,
      hasSignature: false,
      createdAt: '2026-03-02T00:00:00Z',
      certificatesCount: 0,
    },
  ];

  it('menampilkan empty state jika daftar template kosong', () => {
    render(
      <CertificateTemplateTable
        templates={[]}
        onActivate={vi.fn()}
        onEdit={vi.fn()}
        onEditLayout={vi.fn()}
        onPreviewDesign={vi.fn()}
        onPreviewSignature={vi.fn()}
      />,
    );

    expect(screen.getByText('Belum Ada Template Sertifikat')).toBeInTheDocument();
  });

  it('menampilkan baris template dengan badge status yang sesuai', () => {
    render(
      <CertificateTemplateTable
        templates={dummyTemplates}
        onActivate={vi.fn()}
        onEdit={vi.fn()}
        onEditLayout={vi.fn()}
        onPreviewDesign={vi.fn()}
        onPreviewSignature={vi.fn()}
      />,
    );

    expect(screen.getByText('Template Desain Utama')).toBeInTheDocument();
    expect(screen.getByText('Template Desain Cadangan')).toBeInTheDocument();
    expect(screen.getByText('Aktif')).toBeInTheDocument();
    expect(screen.getByText('Tidak Aktif')).toBeInTheDocument();
    expect(screen.getByText('10 sertifikat')).toBeInTheDocument();
  });

  it('memanggil handler saat tombol aksi diklik', () => {
    const onActivate = vi.fn();
    const onEditLayout = vi.fn();
    const onPreviewDesign = vi.fn();
    const onPreviewSignature = vi.fn();

    render(
      <CertificateTemplateTable
        templates={dummyTemplates}
        onActivate={onActivate}
        onEdit={vi.fn()}
        onEditLayout={onEditLayout}
        onPreviewDesign={onPreviewDesign}
        onPreviewSignature={onPreviewSignature}
      />,
    );

    // Template 2 tidak aktif, ada tombol "Aktifkan"
    const activateBtn = screen.getByText('Aktifkan');
    fireEvent.click(activateBtn);
    expect(onActivate).toHaveBeenCalledWith(dummyTemplates[1]);

    // Tombol Tata Letak
    const layoutButtons = screen.getAllByTitle('Atur Tata Letak Koordinat');
    expect(layoutButtons[0]).toBeDefined();
    fireEvent.click(layoutButtons[0]!);
    expect(onEditLayout).toHaveBeenCalledWith(dummyTemplates[0]);

    // Tombol PDF
    const pdfButtons = screen.getAllByTitle('Pratinjau Desain PDF');
    expect(pdfButtons[0]).toBeDefined();
    fireEvent.click(pdfButtons[0]!);
    expect(onPreviewDesign).toHaveBeenCalledWith(dummyTemplates[0]);

    // Tombol TTD (hanya template 1 yang punya hasSignature)
    const ttdButton = screen.getByTitle('Pratinjau Tanda Tangan');
    expect(ttdButton).toBeDefined();
    fireEvent.click(ttdButton);
    expect(onPreviewSignature).toHaveBeenCalledWith(dummyTemplates[0]);
  });
});

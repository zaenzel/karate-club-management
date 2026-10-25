import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TemplateLayoutEditorModal } from './template-layout-editor-modal';
import type { CertificateTemplate } from '../types/template';
import * as fileUrlApi from '../api/get-template-file-url';

vi.mock('../api/get-template-file-url', () => ({
  getTemplatePreviewUrl: vi.fn().mockResolvedValue('http://localhost:9000/preview.png'),
}));

describe('TemplateLayoutEditorModal', () => {
  const dummyTemplate: CertificateTemplate = {
    id: 'tmpl-1',
    name: 'Template Ujian 2026',
    signerName: 'Yudi Fatkhurohman',
    signerTitle: 'Ketua',
    paperSize: 'A4',
    fieldLayout: {
      name: { x: 340, y: 395, fontSize: 14, align: 'left' },
      birth: { x: 340, y: 360, fontSize: 12, align: 'left' },
    },
    isActive: true,
    hasSignature: true,
    createdAt: '2026-03-01T00:00:00Z',
    certificatesCount: 5,
  };

  it('renders title and loads preview', async () => {
    render(
      <TemplateLayoutEditorModal
        isOpen={true}
        onClose={vi.fn()}
        template={dummyTemplate}
        onSave={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Editor Tata Letak Sertifikat: Template Ujian 2026/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(fileUrlApi.getTemplatePreviewUrl).toHaveBeenCalledWith('tmpl-1');
    });
  });

  it('triggers onSave with current layout when save button is clicked', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <TemplateLayoutEditorModal
        isOpen={true}
        onClose={vi.fn()}
        template={dummyTemplate}
        onSave={onSave}
      />,
    );

    const saveBtn = screen.getByRole('button', { name: /Simpan Tata Letak/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.objectContaining({ x: 340, y: 395 }),
        birth: expect.objectContaining({ x: 340, y: 360 }),
      }),
    );
  });

  it('allows editing coordinates via input fields', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <TemplateLayoutEditorModal
        isOpen={true}
        onClose={vi.fn()}
        template={dummyTemplate}
        onSave={onSave}
      />,
    );

    const xInput = screen.getByLabelText(/Posisi X/i);
    fireEvent.change(xInput, { target: { value: '380' } });

    const saveBtn = screen.getByRole('button', { name: /Simpan Tata Letak/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.objectContaining({ x: 380 }),
      }),
    );
  });

  it('allows nudging coordinates with nudge buttons and keyboard arrows', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <TemplateLayoutEditorModal
        isOpen={true}
        onClose={vi.fn()}
        template={dummyTemplate}
        onSave={onSave}
      />,
    );

    // Click ArrowUp nudge button
    const upBtn = screen.getByTitle(/Geser ke Atas/i);
    fireEvent.click(upBtn);

    // Press ArrowRight keyboard key
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    const saveBtn = screen.getByRole('button', { name: /Simpan Tata Letak/i });
    fireEvent.click(saveBtn);

    // Initial name: { x: 340, y: 395 }
    // After ArrowUp (Y+1) and ArrowRight (X+1): { x: 341, y: 396 }
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.objectContaining({ x: 341, y: 396 }),
      }),
    );
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('tidak merender apapun saat isOpen = false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="Hapus Data"
        description="Apakah Anda yakin?"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('merender judul, deskripsi, dan tombol aksi saat isOpen = true', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Mulai Ujian"
        description="Apakah Anda yakin ingin memulai ujian?"
        confirmText="Mulai Sekarang"
        cancelText="Batal"
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText('Mulai Ujian')).toBeInTheDocument();
    expect(screen.getByText('Apakah Anda yakin ingin memulai ujian?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Mulai Sekarang' });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByRole('button', { name: 'Batal' });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

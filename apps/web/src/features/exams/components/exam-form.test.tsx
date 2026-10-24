import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExamForm } from './exam-form';

describe('ExamForm', () => {
  it('merender form dengan default values', () => {
    render(<ExamForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Nama Ujian')).toBeInTheDocument();
    expect(screen.getByLabelText('Jenis Ujian')).toBeInTheDocument();
    expect(screen.getByLabelText('Tanggal Pelaksanaan')).toBeInTheDocument();
    expect(screen.getByLabelText('Tempat / Lokasi')).toBeInTheDocument();
    expect(screen.getByLabelText('Biaya Dasar Peserta (Rp)')).toBeInTheDocument();
    expect(screen.getByLabelText('Cabang Penyelenggara')).toBeInTheDocument();
  });

  it('memvalidasi input wajib', async () => {
    const onSubmit = vi.fn();
    render(<ExamForm onSubmit={onSubmit} />);

    // Kosongkan input nama
    const nameInput = screen.getByLabelText('Nama Ujian');
    fireEvent.change(nameInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: 'Simpan Ujian' });
    fireEvent.click(submitBtn);

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

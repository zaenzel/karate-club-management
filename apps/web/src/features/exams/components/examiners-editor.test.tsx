import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExaminersEditor } from './examiners-editor';

describe('ExaminersEditor', () => {
  it('merender daftar penguji awal', () => {
    const initial = [
      { id: '1', name: 'Sensei Tanaka', isChief: true },
      { id: '2', name: 'Sensei Budi', isChief: false },
    ];
    render(<ExaminersEditor initialExaminers={initial} onSave={vi.fn()} />);

    expect(screen.getByDisplayValue('Sensei Tanaka')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sensei Budi')).toBeInTheDocument();
  });

  it('bisa menambah penguji baru', () => {
    render(<ExaminersEditor onSave={vi.fn()} />);

    const addBtn = screen.getByRole('button', { name: /Tambah Penguji/i });
    fireEvent.click(addBtn);

    const inputs = screen.getAllByPlaceholderText(/Nama penguji/i);
    expect(inputs.length).toBe(2);
  });
});

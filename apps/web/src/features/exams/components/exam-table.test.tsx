import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Exam } from '../types/exam';
import { ExamTable } from './exam-table';

describe('ExamTable', () => {
  const mockExams: Exam[] = [
    {
      id: 'exam-1',
      name: 'Ujian Kyu Semester Genap',
      type: 'KYU',
      date: '2026-11-20',
      location: 'Dojo Senayan',
      baseFee: 150000,
      status: 'DRAFT',
      branch: { id: 'b1', name: 'Cabang Jakarta Pusat' },
      examiners: [],
      stats: { participants: 5, passed: 0, failed: 0, pending: 5 },
      createdAt: '2026-10-01',
      updatedAt: '2026-10-01',
    },
    {
      id: 'exam-2',
      name: 'Ujian Dan Nasional',
      type: 'DAN',
      date: '2026-12-01',
      location: 'GOR Padepokan',
      baseFee: 300000,
      status: 'FINISHED',
      branch: null,
      examiners: [],
      stats: { participants: 10, passed: 8, failed: 2, pending: 0 },
      createdAt: '2026-09-01',
      updatedAt: '2026-09-01',
    },
  ];

  it('merender baris tabel dengan data ujian', () => {
    render(<ExamTable exams={mockExams} onDelete={vi.fn()} />);

    expect(screen.getByText('Ujian Kyu Semester Genap')).toBeInTheDocument();
    expect(screen.getByText('Ujian Dan Nasional')).toBeInTheDocument();
    expect(screen.getByText('Dojo Senayan')).toBeInTheDocument();
    expect(screen.getByText('Cabang Jakarta Pusat')).toBeInTheDocument();
    expect(screen.getByText('Pengurus Pusat')).toBeInTheDocument();
  });

  it('menampilkan tombol hapus hanya untuk status Draf', () => {
    const onDelete = vi.fn();
    render(<ExamTable exams={mockExams} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole('button', {
      name: 'Hapus Ujian Kyu Semester Genap',
    });
    expect(deleteBtn).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: 'Hapus Ujian Dan Nasional' }),
    ).not.toBeInTheDocument();

    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockExams[0]);
  });
});

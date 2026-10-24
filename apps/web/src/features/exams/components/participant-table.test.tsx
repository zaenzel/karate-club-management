import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ExamParticipant } from '../types/participant';
import { ParticipantTable } from './participant-table';

describe('ParticipantTable', () => {
  const mockParticipants: ExamParticipant[] = [
    {
      id: 'part-1',
      examId: 'exam-1',
      member: {
        id: 'mem-1',
        memberNumber: 'MEM-2026-0001',
        name: 'Budi Santoso',
        branch: { id: 'b1', name: 'Cabang Jakarta' },
      },
      from: {
        belt: { id: 'belt-1', name: 'Putih', order: 1, colorHex: '#fff' },
        kyu: 10,
        dan: null,
      },
      fee: 150000,
      paymentStatus: 'PAID',
      result: 'PASSED',
      kyuDecrease: 1,
      danIncrease: null,
      toBelt: { id: 'belt-2', name: 'Kuning', order: 2, colorHex: '#ff0' },
      preview: {
        belt: { id: 'belt-2', name: 'Kuning', order: 2, colorHex: '#ff0' },
        kyu: 9,
        dan: null,
      },
      createdAt: '2026-10-01',
    },
  ];

  it('merender data peserta dengan lengkap', () => {
    render(
      <ParticipantTable
        participants={mockParticipants}
        examStatus="ONGOING"
        onEditResult={vi.fn()}
        onEditPayment={vi.fn()}
        onRemoveParticipant={vi.fn()}
      />,
    );

    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('MEM-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Lunas')).toBeInTheDocument();
    expect(screen.getByText('Lulus')).toBeInTheDocument();
  });

  it('memanggil onEditResult ketika tombol input hasil diklik', () => {
    const onEditResult = vi.fn();
    render(
      <ParticipantTable
        participants={mockParticipants}
        examStatus="ONGOING"
        onEditResult={onEditResult}
        onEditPayment={vi.fn()}
        onRemoveParticipant={vi.fn()}
      />,
    );

    const btn = screen.getByRole('button', { name: 'Input hasil Budi Santoso' });
    fireEvent.click(btn);
    expect(onEditResult).toHaveBeenCalledWith(mockParticipants[0]);
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { GradeHistoryItem } from '../types/member';
import { GradeHistoryList } from './grade-history-list';

const mockHistories: GradeHistoryItem[] = [
  {
    id: 'gh-1',
    source: 'INITIAL',
    fromBelt: null,
    toBelt: { id: 'belt-1', name: 'Putih', order: 1, colorHex: '#FFFFFF' },
    fromKyu: null,
    toKyu: 10,
    fromDan: null,
    toDan: null,
    occurredAt: '2026-01-01T00:00:00.000Z',
    exam: null,
  },
  {
    id: 'gh-2',
    source: 'EXAM',
    fromBelt: { id: 'belt-1', name: 'Putih', order: 1, colorHex: '#FFFFFF' },
    toBelt: { id: 'belt-2', name: 'Kuning', order: 2, colorHex: '#FACC15' },
    fromKyu: 10,
    toKyu: 9,
    fromDan: null,
    toDan: null,
    occurredAt: '2026-06-01T00:00:00.000Z',
    exam: { id: 'exam-1', name: 'Ujian Kyu Semester 1', date: '2026-06-01' },
  },
];

describe('GradeHistoryList', () => {
  it('merender riwayat INITIAL dan EXAM dengan benar', () => {
    render(<GradeHistoryList histories={mockHistories} />);

    expect(screen.getByText('Input Awal')).toBeInTheDocument();
    expect(screen.getByText(/Ujian: Ujian Kyu Semester 1/i)).toBeInTheDocument();
    expect(screen.getAllByText('Putih, Kyu 10').length).toBeGreaterThan(0);
    expect(screen.getByText('Kuning, Kyu 9')).toBeInTheDocument();
  });
});

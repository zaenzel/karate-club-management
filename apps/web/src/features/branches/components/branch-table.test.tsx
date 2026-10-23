import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BranchTable } from './branch-table';
import type { Branch } from '../types/branch';

const mockBranches: Branch[] = [
  {
    id: 'branch-1',
    code: 'JKT-01',
    name: 'Dojo Jakarta',
    city: 'Jakarta',
    address: 'Jl. Sudirman',
    phone: '0812345678',
    headCoach: null,
    memberCount: 12,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('BranchTable', () => {
  it('renders empty state when there are no branches', () => {
    render(<BranchTable branches={[]} onDelete={vi.fn()} />);

    expect(screen.getByText('Belum ada cabang')).toBeInTheDocument();
  });

  it('renders error state and handles retry', async () => {
    const onRetry = vi.fn();
    render(
      <BranchTable
        branches={[]}
        isError
        errorMessage="Koneksi terputus"
        onRetry={onRetry}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Koneksi terputus');
    await userEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders branches list and triggers delete', async () => {
    const onDelete = vi.fn();
    render(<BranchTable branches={mockBranches} onDelete={onDelete} />);

    expect(screen.getByText('JKT-01')).toBeInTheDocument();
    expect(screen.getByText('Dojo Jakarta')).toBeInTheDocument();
    expect(screen.getByText('12 anggota')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: 'Hapus cabang Dojo Jakarta' });
    await userEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockBranches[0]);
  });
});

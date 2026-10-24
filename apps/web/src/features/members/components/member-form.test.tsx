import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Belt, BranchOption } from '../types/member';
import { MemberForm } from './member-form';

const mockBranches: BranchOption[] = [{ id: 'b-1', code: 'BDG-01', name: 'Dojo Bandung' }];

const mockBelts: Belt[] = [
  { id: 'belt-1', name: 'Putih', order: 1, colorHex: '#FFFFFF' },
  { id: 'belt-6', name: 'Hitam', order: 6, colorHex: '#111111' },
];

describe('MemberForm', () => {
  it('merender field form pendaftaran member baru', () => {
    render(<MemberForm onSubmit={vi.fn()} branchOptions={mockBranches} belts={mockBelts} />);

    expect(screen.getByLabelText(/Tipe Member/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tempat Lahir/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tanggal Lahir/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cabang Asal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alamat Lengkap/i)).toBeInTheDocument();
    expect(screen.getByText(/Tingkatan Awal/i)).toBeInTheDocument();
  });

  it('tidak menampilkan bagian tingkatan awal pada mode edit', () => {
    render(
      <MemberForm
        isEdit={true}
        onSubmit={vi.fn()}
        branchOptions={mockBranches}
        belts={mockBelts}
      />,
    );

    expect(screen.queryByText(/Tingkatan Awal/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Perbarui Member/i })).toBeInTheDocument();
  });

  it('bisa membuka bagian tingkatan awal pada mode tambah', async () => {
    const user = userEvent.setup();

    render(<MemberForm onSubmit={vi.fn()} branchOptions={mockBranches} belts={mockBelts} />);

    const toggleBtn = screen.getByText(/Tingkatan Awal/i);
    await user.click(toggleBtn);

    expect(screen.getByLabelText(/Warna Sabuk/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tingkat Kyu/i)).toBeInTheDocument();
  });
});

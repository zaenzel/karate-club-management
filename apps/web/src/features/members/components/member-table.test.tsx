import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Member } from '../types/member';
import { MemberTable } from './member-table';

const mockMembers: Member[] = [
  {
    id: 'm-1',
    memberNumber: 'M202600001',
    type: 'STUDENT',
    name: 'Budi Santoso',
    birthPlace: 'Bandung',
    birthDate: '2012-05-01',
    address: 'Jl. Merdeka No. 1',
    phone: '08123456789',
    branch: { id: 'b-1', code: 'BDG-01', name: 'Dojo Bandung' },
    belt: { id: 'belt-white', name: 'Putih', order: 1, colorHex: '#FFFFFF' },
    kyu: 10,
    dan: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('MemberTable', () => {
  it('merender baris member dengan benar', () => {
    render(<MemberTable members={mockMembers} onDelete={vi.fn()} />);

    expect(screen.getByText('M202600001')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('Murid')).toBeInTheDocument();
    expect(screen.getByText('Dojo Bandung')).toBeInTheDocument();
    expect(screen.getByText('Putih')).toBeInTheDocument();
    expect(screen.getByText('Putih, Kyu 10')).toBeInTheDocument();
  });

  it('menampilkan pesan kosong bila tidak ada data', () => {
    render(<MemberTable members={[]} onDelete={vi.fn()} />);

    expect(screen.getByText('Belum ada data member')).toBeInTheDocument();
  });
});

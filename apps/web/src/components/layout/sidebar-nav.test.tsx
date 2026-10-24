import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SidebarNav } from './sidebar-nav';

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('SidebarNav', () => {
  beforeEach(() => {
    mockPathname = '/';
    vi.clearAllMocks();
  });

  it('merender semua menu navigasi dengan benar', () => {
    render(<SidebarNav />);

    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Cabang (Dojo)')).toBeInTheDocument();
    expect(screen.getByText('Member & Pelatih')).toBeInTheDocument();
    expect(screen.getByText('Ujian Kenaikan Sabuk')).toBeInTheDocument();
    expect(screen.getByText('Sertifikat')).toBeInTheDocument();
    expect(screen.getByText('Template Sertifikat')).toBeInTheDocument();
    expect(screen.getByText('Produk')).toBeInTheDocument();
  });

  it('menandai item aktif berdasarkan pathname', () => {
    mockPathname = '/branches';
    render(<SidebarNav />);

    const branchLink = screen.getByRole('link', { name: /Cabang \(Dojo\)/i });
    expect(branchLink).toHaveAttribute('aria-current', 'page');

    const homeLink = screen.getByRole('link', { name: /Beranda/i });
    expect(homeLink).not.toHaveAttribute('aria-current');
  });

  it('memanggil onNavigate saat menu diklik', async () => {
    const user = userEvent.setup();
    const handleNavigate = vi.fn();

    render(<SidebarNav onNavigate={handleNavigate} />);

    const memberLink = screen.getByRole('link', { name: /Member & Pelatih/i });
    await user.click(memberLink);

    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });
});

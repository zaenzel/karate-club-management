import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardShell } from './dashboard-shell';

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('DashboardShell', () => {
  beforeEach(() => {
    mockPathname = '/';
    vi.clearAllMocks();
  });

  it('merender children dan slot user', () => {
    render(
      <DashboardShell userSlot={<span data-testid="user-slot">User Admin</span>}>
        <div data-testid="dashboard-content">Konten Dashboard</div>
      </DashboardShell>,
    );

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.getAllByTestId('user-slot').length).toBeGreaterThan(0);
  });

  it('membuka dan menutup sidebar drawer mobile', async () => {
    const user = userEvent.setup();

    render(
      <DashboardShell>
        <div>Konten</div>
      </DashboardShell>,
    );

    const hamburgerBtn = screen.getByRole('button', { name: /Buka menu navigasi/i });
    expect(hamburgerBtn).toBeInTheDocument();

    const mobileDialog = screen.getByRole('dialog', { name: /Menu Navigasi Mobile/i });
    expect(mobileDialog).toHaveClass('-translate-x-full');

    // Click hamburger to open
    await user.click(hamburgerBtn);
    expect(mobileDialog).toHaveClass('translate-x-0');

    // Click close button inside drawer
    const closeBtn = screen.getByRole('button', { name: /Tutup menu navigasi/i });
    await user.click(closeBtn);
    expect(mobileDialog).toHaveClass('-translate-x-full');
  });

  it('menutup sidebar drawer saat menekan Escape', async () => {
    const user = userEvent.setup();

    render(
      <DashboardShell>
        <div>Konten</div>
      </DashboardShell>,
    );

    const hamburgerBtn = screen.getByRole('button', { name: /Buka menu navigasi/i });
    await user.click(hamburgerBtn);

    const mobileDialog = screen.getByRole('dialog', { name: /Menu Navigasi Mobile/i });
    expect(mobileDialog).toHaveClass('translate-x-0');

    await user.keyboard('{Escape}');
    expect(mobileDialog).toHaveClass('-translate-x-full');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Achievement } from '../types/achievement';
import { AchievementList } from './achievement-list';

const mockAchievements: Achievement[] = [
  {
    id: 'ach-1',
    memberId: 'm-1',
    championship: 'Kejurnas Karate 2026',
    level: 'NATIONAL',
    category: 'Kumite Putra -60kg',
    result: 'Juara 1',
    date: '2026-03-01',
    location: 'Jakarta',
    createdAt: '2026-03-02T00:00:00.000Z',
  },
];

describe('AchievementList', () => {
  it('merender daftar prestasi dengan benar', () => {
    render(
      <AchievementList
        achievements={mockAchievements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Kejurnas Karate 2026')).toBeInTheDocument();
    expect(screen.getByText('Juara 1')).toBeInTheDocument();
    expect(screen.getByText('Nasional')).toBeInTheDocument();
    expect(screen.getByText('Kumite Putra -60kg')).toBeInTheDocument();
  });

  it('menampilkan pesan kosong bila belum ada prestasi', () => {
    render(
      <AchievementList achievements={[]} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Belum ada catatan prestasi untuk anggota ini.')).toBeInTheDocument();
  });
});

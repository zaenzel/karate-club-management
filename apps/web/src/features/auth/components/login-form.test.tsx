import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('menampilkan validasi error saat input kosong disubmit', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByText('Email wajib diisi')).toBeInTheDocument();
    expect(await screen.findByText('Kata sandi wajib diisi')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('menonaktifkan tombol submit saat isSubmitting bernilai true', () => {
    render(<LoginForm onSubmit={vi.fn()} isSubmitting />);

    const button = screen.getByRole('button', { name: 'Memproses…' });
    expect(button).toBeDisabled();
  });

  it('menampilkan pesan error dari server dengan role="alert"', () => {
    render(<LoginForm onSubmit={vi.fn()} submitError="Email atau password salah" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Email atau password salah');
  });

  it('memanggil onSubmit ketika form diisi dengan valid', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'admin@karate.local');
    await userEvent.type(screen.getByLabelText('Kata sandi'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        email: 'admin@karate.local',
        password: 'password123',
      },
      expect.anything(),
    );
  });
});

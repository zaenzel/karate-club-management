import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BranchForm } from './branch-form';

describe('BranchForm', () => {
  it('renders validation errors when submitting empty required fields', async () => {
    const onSubmit = vi.fn();
    render(<BranchForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Kode cabang minimal 2 karakter')).toBeInTheDocument();
    expect(await screen.findByText('Kota minimal 2 karakter')).toBeInTheDocument();
    expect(await screen.findByText('Nama cabang minimal 2 karakter')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables submit button when isSubmitting is true', () => {
    render(<BranchForm onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByRole('button', { name: 'Menyimpan…' })).toBeDisabled();
  });

  it('displays submitError alert', () => {
    render(<BranchForm onSubmit={vi.fn()} submitError="Kode cabang sudah digunakan" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Kode cabang sudah digunakan');
  });

  it('calls onSubmit with valid form data', async () => {
    const onSubmit = vi.fn();
    render(<BranchForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Kode Cabang'), 'BDG-01');
    await userEvent.type(screen.getByLabelText('Kota'), 'Bandung');
    await userEvent.type(screen.getByLabelText('Nama Cabang'), 'Dojo Bandung');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'BDG-01',
        city: 'Bandung',
        name: 'Dojo Bandung',
      }),
      expect.anything(),
    );
  });

  it('renders coachOptions in dropdown', () => {
    const coachOptions = [{ id: 'c-1', name: 'Sensei Budi' }];
    render(<BranchForm onSubmit={vi.fn()} coachOptions={coachOptions} />);

    expect(screen.getByText('Sensei Budi')).toBeInTheDocument();
  });
});

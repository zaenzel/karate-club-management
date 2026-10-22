import { describe, expect, it } from 'vitest';

import { loginSchema } from './login-schema';

describe('loginSchema', () => {
  it('berhasil jika email valid dan password tidak kosong', () => {
    const result = loginSchema.safeParse({
      email: 'admin@karate.local',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('gagal jika email kosong', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Email wajib diisi');
    }
  });

  it('gagal jika format email salah', () => {
    const result = loginSchema.safeParse({
      email: 'bukan-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Format email tidak valid');
    }
  });

  it('gagal jika kata sandi kosong', () => {
    const result = loginSchema.safeParse({
      email: 'admin@karate.local',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Kata sandi wajib diisi');
    }
  });
});

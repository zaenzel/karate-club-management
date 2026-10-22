import { loadEnv } from './env.js';

const base = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_SECRET: 'super_secret_jwt_key_karate_club_dev_min_32_chars',
};

describe('loadEnv', () => {
  it('memakai nilai default bila env kosong', () => {
    const env = loadEnv(base);
    expect(env.API_PORT).toBe(4000);
    expect(env.WEB_ORIGIN).toBe('http://localhost:3000');
    expect(env.JWT_EXPIRES_IN).toBe('8h');
    expect(env.AUTH_COOKIE_NAME).toBe('karate_session');
    expect(env.SUPERADMIN_NAME).toBe('Super Admin');
  });

  it('mengubah API_PORT menjadi angka', () => {
    expect(loadEnv({ ...base, API_PORT: '5000' }).API_PORT).toBe(5000);
  });

  it('gagal bila WEB_ORIGIN bukan URL', () => {
    expect(() => loadEnv({ ...base, WEB_ORIGIN: 'bukan-url' })).toThrow(
      'Konfigurasi environment tidak valid',
    );
  });

  it('gagal bila DATABASE_URL tidak ada', () => {
    expect(() => loadEnv({ JWT_SECRET: base.JWT_SECRET })).toThrow('DATABASE_URL');
  });

  it('gagal bila JWT_SECRET kurang dari 32 karakter', () => {
    expect(() => loadEnv({ ...base, JWT_SECRET: 'terlalu-pendek' })).toThrow('JWT_SECRET');
  });
});

import { loadEnv } from './env.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db' };

describe('loadEnv', () => {
  it('memakai nilai default bila env kosong', () => {
    const env = loadEnv(base);
    expect(env.API_PORT).toBe(4000);
    expect(env.WEB_ORIGIN).toBe('http://localhost:3000');
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
    expect(() => loadEnv({})).toThrow('DATABASE_URL');
  });
});

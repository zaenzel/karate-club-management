import { loadEnv } from './env.js';

describe('loadEnv', () => {
  it('memakai nilai default bila env kosong', () => {
    const env = loadEnv({});
    expect(env.API_PORT).toBe(4000);
    expect(env.WEB_ORIGIN).toBe('http://localhost:3000');
  });

  it('mengubah API_PORT menjadi angka', () => {
    expect(loadEnv({ API_PORT: '5000' }).API_PORT).toBe(5000);
  });

  it('gagal bila WEB_ORIGIN bukan URL', () => {
    expect(() => loadEnv({ WEB_ORIGIN: 'bukan-url' })).toThrow(
      'Konfigurasi environment tidak valid',
    );
  });
});

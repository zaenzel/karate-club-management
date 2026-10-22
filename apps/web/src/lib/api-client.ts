import axios, { type AxiosError } from 'axios';

import { env } from '@/config/env';
import { ApiError } from '@/types/api';

/**
 * Instance HTTP tunggal untuk seluruh aplikasi.
 * HANYA boleh di-import dari `src/features/<nama>/api/*`.
 * Komponen tidak boleh memanggil ini secara langsung (dijaga oleh ESLint).
 */
export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  // Tempat menyisipkan token auth, misalnya:
  // const token = useAuthStore.getState().token;
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message ?? error.message ?? 'Terjadi kesalahan jaringan';

    if (
      status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/login?next=${next}`;
    }

    return Promise.reject(new ApiError(message, status, error.response?.data));
  },
);

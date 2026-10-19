import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Satu-satunya tempat untuk membaca environment variable.
 * Jangan pakai `process.env.X` langsung di tempat lain — import `env` dari sini.
 * Variabel yang tidak valid akan membuat app gagal start (fail fast).
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default('Karate Club Management'),
    // Default `/api` mengarah ke mock API bawaan (src/app/api). Ganti ke URL backend asli.
    NEXT_PUBLIC_API_URL: z.string().min(1).default('/api'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

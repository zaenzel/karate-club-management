import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  AUTH_COOKIE_NAME: z.string().default('karate_session'),
  SUPERADMIN_EMAIL: z.string().email().optional(),
  SUPERADMIN_PASSWORD: z.string().min(8).optional(),
  SUPERADMIN_NAME: z.string().optional().default('Super Admin'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Satu-satunya tempat membaca environment variable di apps/api.
 * Variabel yang tidak valid membuat app gagal start (fail fast).
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Konfigurasi environment tidak valid:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/**
 * Saat development, baca `.env` di root repo. Variabel yang sudah ada di proses tidak ditimpa,
 * jadi di server/container cukup set env biasa (file ini tidak ada).
 */
export function loadRootEnvFile() {
  const file = fileURLToPath(new URL('../../../../.env', import.meta.url));
  if (existsSync(file)) process.loadEnvFile(file);
}

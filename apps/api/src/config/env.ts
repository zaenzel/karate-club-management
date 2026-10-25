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
  S3_ENDPOINT: z.string().min(1).default('http://localhost:9000'),
  S3_BUCKET: z.string().min(1).default('karate-files'),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_ACCESS_KEY: z.string().min(1).default('minio'),
  S3_SECRET_KEY: z.string().min(1).default('minio_dev_password'),
  S3_FORCE_PATH_STYLE: z
    .preprocess((val) => {
      if (val === undefined || val === '') return true;
      if (typeof val === 'string') return val === 'true' || val === '1';
      return Boolean(val);
    }, z.boolean())
    .default(true),
  S3_PRESIGN_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  S3_PUBLIC_ENDPOINT: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
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

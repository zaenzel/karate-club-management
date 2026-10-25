import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),
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
  FONT_PATH: z.string().default('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(2),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Konfigurasi environment worker tidak valid:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

export function loadRootEnvFile() {
  const file = fileURLToPath(new URL('../../../../.env', import.meta.url));
  if (existsSync(file)) process.loadEnvFile(file);
}

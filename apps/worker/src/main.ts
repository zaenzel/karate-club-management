import { createPrismaClient, CertificateStatus } from '@karate/db';
import { Worker } from 'bullmq';
import { loadEnv, loadRootEnvFile } from './config/env.js';
import { processCertificateJob } from './processor.js';
import { WorkerStorage } from './storage.js';

loadRootEnvFile();
const env = loadEnv();

const prisma = createPrismaClient(env.DATABASE_URL);
const storage = new WorkerStorage(env);

const QUEUE_NAME = 'certificate-render';

console.log(
  `[Worker] Memulai worker render sertifikat pada antrian "${QUEUE_NAME}" (concurrency: ${env.WORKER_CONCURRENCY})...`,
);

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    await processCertificateJob(job, prisma, storage, env);
  },
  {
    connection: {
      url: env.REDIS_URL,
    },
    concurrency: env.WORKER_CONCURRENCY,
  },
);

worker.on('failed', async (job, err) => {
  if (!job) return;
  console.error(`[Worker] Job ${job.id} gagal: ${err.message}`);

  const maxAttempts = job.opts.attempts ?? 3;
  if (job.attemptsMade >= maxAttempts) {
    console.error(
      `[Worker] Percobaan maksimum (${maxAttempts}) tercapai untuk sertifikat ${job.data.certificateId}. Menandai status FAILED.`,
    );
    await prisma.certificate
      .update({
        where: { id: job.data.certificateId },
        data: { status: CertificateStatus.FAILED },
      })
      .catch((e) => console.error('[Worker] Gagal mengupdate status FAILED:', e));
  }
});

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} selesai sukses.`);
});

// Graceful shutdown
async function shutdown() {
  console.log('[Worker] Menghentikan worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

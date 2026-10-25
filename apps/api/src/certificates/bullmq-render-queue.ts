import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ENV } from '../config/config.module.js';
import type { Env } from '../config/env.js';
import type { CertificateRenderQueue } from './certificate-render-queue.js';

export const CERTIFICATE_RENDER_QUEUE_NAME = 'certificate-render';

@Injectable()
export class BullmqCertificateRenderQueue implements CertificateRenderQueue, OnModuleDestroy {
  private readonly queue: Queue;

  constructor(@Inject(ENV) env: Env) {
    this.queue = new Queue(CERTIFICATE_RENDER_QUEUE_NAME, {
      connection: {
        url: env.REDIS_URL,
      },
    });
  }

  async enqueue(certificateId: string): Promise<void> {
    await this.queue.add(
      'render',
      { certificateId },
      {
        jobId: certificateId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

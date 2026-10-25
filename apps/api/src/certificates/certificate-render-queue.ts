import { Injectable, Logger } from '@nestjs/common';

export const CERTIFICATE_RENDER_QUEUE = Symbol('CERTIFICATE_RENDER_QUEUE');

export interface CertificateRenderQueue {
  enqueue(certificateId: string): Promise<void>;
}

@Injectable()
export class NoopCertificateRenderQueue implements CertificateRenderQueue {
  private readonly logger = new Logger(NoopCertificateRenderQueue.name);

  async enqueue(certificateId: string): Promise<void> {
    this.logger.debug(`[NoopQueue] Enqueue certificateId: ${certificateId}`);
  }
}

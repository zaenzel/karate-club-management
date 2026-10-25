import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { BullmqCertificateRenderQueue } from './bullmq-render-queue.js';
import { CERTIFICATE_RENDER_QUEUE } from './certificate-render-queue.js';
import { CertificatesController, ExamCertificatesController } from './certificates.controller.js';
import { CertificatesService } from './certificates.service.js';

@Module({
  imports: [AuditModule, StorageModule],
  controllers: [CertificatesController, ExamCertificatesController],
  providers: [
    CertificatesService,
    {
      provide: CERTIFICATE_RENDER_QUEUE,
      useClass: BullmqCertificateRenderQueue,
    },
  ],
  exports: [CertificatesService, CERTIFICATE_RENDER_QUEUE],
})
export class CertificatesModule {}

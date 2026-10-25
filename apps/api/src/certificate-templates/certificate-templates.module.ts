import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { CertificateTemplatesController } from './certificate-templates.controller.js';
import { CertificateTemplatesService } from './certificate-templates.service.js';

@Module({
  imports: [AuditModule, StorageModule],
  controllers: [CertificateTemplatesController],
  providers: [CertificateTemplatesService],
  exports: [CertificateTemplatesService],
})
export class CertificateTemplatesModule {}

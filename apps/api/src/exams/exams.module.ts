import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { CertificatesModule } from '../certificates/certificates.module.js';
import { CertificatesService } from '../certificates/certificates.service.js';
import { EXAM_FINISHED_HANDLERS } from './exam-finished-handler.js';
import { ExamsController } from './exams.controller.js';
import { ExamsService } from './exams.service.js';

@Module({
  imports: [AuditModule, CertificatesModule],
  controllers: [ExamsController],
  providers: [
    ExamsService,
    {
      provide: EXAM_FINISHED_HANDLERS,
      useFactory: (certService: CertificatesService) => [certService],
      inject: [CertificatesService],
    },
  ],
  exports: [ExamsService],
})
export class ExamsModule {}

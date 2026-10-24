import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { ExamsController } from './exams.controller.js';
import { ExamsService } from './exams.service.js';

@Module({
  imports: [AuditModule],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}

import { Module } from '@nestjs/common';

import { AuditModule } from './audit/audit.module.js';
import { ConfigModule } from './config/config.module.js';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [ConfigModule, PrismaModule, AuditModule],
  controllers: [HealthController],
})
export class AppModule {}

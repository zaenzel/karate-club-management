import { Module } from '@nestjs/common';

import { AchievementsModule } from './achievements/achievements.module.js';
import { AuditModule } from './audit/audit.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BeltsModule } from './belts/belts.module.js';
import { BranchesModule } from './branches/branches.module.js';
import { ConfigModule } from './config/config.module.js';
import { ExamsModule } from './exams/exams.module.js';
import { HealthController } from './health/health.controller.js';
import { MembersModule } from './members/members.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

import { CertificateTemplatesModule } from './certificate-templates/certificate-templates.module.js';
import { CertificatesModule } from './certificates/certificates.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuditModule,
    StorageModule,
    CertificateTemplatesModule,
    CertificatesModule,
    AuthModule,
    BranchesModule,
    BeltsModule,
    MembersModule,
    AchievementsModule,
    ExamsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

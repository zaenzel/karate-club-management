import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { BeltsController } from './belts.controller.js';
import { BeltsService } from './belts.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [BeltsController],
  providers: [BeltsService],
  exports: [BeltsService],
})
export class BeltsModule {}

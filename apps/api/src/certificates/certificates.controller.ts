import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CertificatesService } from './certificates.service.js';
import { listCertificatesSchema, type ListCertificatesQuery } from './dto/list-certificates.dto.js';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listCertificatesSchema)) query: ListCertificatesQuery) {
    return this.certificatesService.list(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.certificatesService.findById(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Query('format') format?: string) {
    const fileFormat = format === 'png' ? 'png' : 'pdf';
    const url = await this.certificatesService.getDownloadUrl(id, fileFormat);
    return { url };
  }

  @Post(':id/reissue')
  reissue(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.certificatesService.reissue(id, user);
  }

  @Post(':id/retry')
  retry(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.certificatesService.retry(id, user);
  }
}

@Controller('exams/:examId/certificates')
export class ExamCertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('backfill')
  backfill(@Param('examId') examId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.certificatesService.backfill(examId, user);
  }
}

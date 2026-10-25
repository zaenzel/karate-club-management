import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser, type AuthenticatedUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CertificateTemplatesService, type UploadedFile } from './certificate-templates.service.js';
import { createTemplateSchema, type CreateTemplateDto } from './dto/create-template.dto.js';
import { updateTemplateSchema, type UpdateTemplateDto } from './dto/update-template.dto.js';

@Controller('certificate-templates')
export class CertificateTemplatesController {
  constructor(private readonly service: CertificateTemplatesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'design', maxCount: 1 },
        { name: 'signature', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 20 * 1024 * 1024, // 20 MB max
        },
      },
    ),
  )
  async create(
    @Body(new ZodValidationPipe(createTemplateSchema)) dto: CreateTemplateDto,
    @UploadedFiles()
    files: {
      design?: UploadedFile[];
      signature?: UploadedFile[];
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const design = files?.design?.[0];
    const signature = files?.signature?.[0];

    if (!design) {
      throw new BadRequestException('File desain PDF wajib diunggah');
    }

    if (signature && signature.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Ukuran file tanda tangan maksimal 2 MB');
    }

    return this.service.create(dto, design, signature, user);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'design', maxCount: 1 },
        { name: 'signature', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 20 * 1024 * 1024,
        },
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTemplateSchema)) dto: UpdateTemplateDto,
    @UploadedFiles()
    files: {
      design?: UploadedFile[];
      signature?: UploadedFile[];
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const design = files?.design?.[0];
    const signature = files?.signature?.[0];

    if (signature && signature.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Ukuran file tanda tangan maksimal 2 MB');
    }

    return this.service.update(id, dto, design, signature, user);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.activate(id, user);
  }

  @Get(':id/files/design')
  async getDesignUrl(@Param('id') id: string) {
    const url = await this.service.getDesignUrl(id);
    return { url };
  }

  @Get(':id/files/signature')
  async getSignatureUrl(@Param('id') id: string) {
    const url = await this.service.getSignatureUrl(id);
    return { url };
  }

  @Get(':id/files/preview')
  async getPreviewUrl(@Param('id') id: string) {
    const url = await this.service.getPreviewUrl(id);
    return { url };
  }
}

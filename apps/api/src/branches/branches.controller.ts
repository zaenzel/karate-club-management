import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CurrentUser, type AuthenticatedUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { BranchesService } from './branches.service.js';
import { createBranchSchema, type CreateBranchDto } from './dto/create-branch.dto.js';
import { listBranchesSchema, type ListBranchesQuery } from './dto/list-branches.query.js';
import { updateBranchSchema, type UpdateBranchDto } from './dto/update-branch.dto.js';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listBranchesSchema)) query: ListBranchesQuery) {
    return this.branchesService.list(query);
  }

  @Get('options')
  options() {
    return this.branchesService.options();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.branchesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(createBranchSchema)) dto: CreateBranchDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.branchesService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBranchSchema)) dto: UpdateBranchDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.branchesService.update(id, dto, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.branchesService.delete(id, user);
  }
}

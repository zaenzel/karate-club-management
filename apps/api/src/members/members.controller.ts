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
import { createMemberSchema, type CreateMemberDto } from './dto/create-member.dto.js';
import { listMembersSchema, type ListMembersQuery } from './dto/list-members.query.js';
import { updateMemberSchema, type UpdateMemberDto } from './dto/update-member.dto.js';
import { MembersService } from './members.service.js';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listMembersSchema)) query: ListMembersQuery) {
    return this.membersService.list(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.membersService.findById(id);
  }

  @Get(':id/grade-history')
  getGradeHistory(@Param('id') id: string) {
    return this.membersService.getGradeHistory(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(createMemberSchema)) dto: CreateMemberDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.membersService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMemberSchema)) dto: UpdateMemberDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.membersService.update(id, dto, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.membersService.delete(id, user);
  }
}

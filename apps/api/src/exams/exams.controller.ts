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
  Put,
  Query,
} from '@nestjs/common';

import { CurrentUser, type AuthenticatedUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { createExamSchema, type CreateExamDto } from './dto/create-exam.dto.js';
import { listExamsSchema, type ListExamsQuery } from './dto/list-exams.query.js';
import {
  addParticipantsSchema,
  eligibleMembersQuerySchema,
  listParticipantsQuerySchema,
  updatePaymentSchema,
  updateResultSchema,
  type AddParticipantsDto,
  type EligibleMembersQuery,
  type ListParticipantsQuery,
  type UpdatePaymentDto,
  type UpdateResultDto,
} from './dto/participants.dto.js';
import { setExaminersSchema, type SetExaminersDto } from './dto/set-examiners.dto.js';
import { updateExamSchema, type UpdateExamDto } from './dto/update-exam.dto.js';
import { ExamsService } from './exams.service.js';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listExamsSchema)) query: ListExamsQuery) {
    return this.examsService.list(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.examsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(createExamSchema)) dto: CreateExamDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.examsService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExamSchema)) dto: UpdateExamDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.examsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.examsService.delete(id, user);
  }

  @Put(':id/examiners')
  setExaminers(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(setExaminersSchema)) dto: SetExaminersDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.examsService.setExaminers(id, dto, user);
  }

  @Post(':id/start')
  start(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.examsService.start(id, user);
  }

  @Get(':id/participants')
  getParticipants(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(listParticipantsQuerySchema)) query: ListParticipantsQuery,
  ) {
    return this.examsService.getParticipants(id, query);
  }

  @Get(':id/eligible-members')
  getEligibleMembers(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(eligibleMembersQuerySchema)) query: EligibleMembersQuery,
  ) {
    return this.examsService.getEligibleMembers(id, query);
  }

  @Post(':id/participants')
  @HttpCode(HttpStatus.OK)
  addParticipants(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addParticipantsSchema)) dto: AddParticipantsDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.examsService.addParticipants(id, dto, user);
  }

  @Delete(':id/participants/:participantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.examsService.removeParticipant(id, participantId, user);
  }

  @Patch(':id/participants/:participantId/payment')
  updatePayment(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body(new ZodValidationPipe(updatePaymentSchema)) dto: UpdatePaymentDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.examsService.updatePayment(id, participantId, dto, user);
  }

  @Patch(':id/participants/:participantId/result')
  updateResult(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body(new ZodValidationPipe(updateResultSchema)) dto: UpdateResultDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.examsService.updateResult(id, participantId, dto, user);
  }

  @Post(':id/finish')
  finish(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.examsService.finish(id, user);
  }
}

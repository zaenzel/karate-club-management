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
} from '@nestjs/common';

import { CurrentUser, type AuthenticatedUser } from '../auth/current-user.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AchievementsService } from './achievements.service.js';
import {
  createAchievementSchema,
  type CreateAchievementDto,
} from './dto/create-achievement.dto.js';
import {
  updateAchievementSchema,
  type UpdateAchievementDto,
} from './dto/update-achievement.dto.js';

@Controller()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('members/:memberId/achievements')
  listByMemberId(@Param('memberId') memberId: string) {
    return this.achievementsService.listByMemberId(memberId);
  }

  @Post('members/:memberId/achievements')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('memberId') memberId: string,
    @Body(new ZodValidationPipe(createAchievementSchema)) dto: CreateAchievementDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.achievementsService.create(memberId, dto, user);
  }

  @Patch('achievements/:id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAchievementSchema)) dto: UpdateAchievementDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.achievementsService.update(id, dto, user);
  }

  @Delete('achievements/:id')
  delete(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.achievementsService.delete(id, user);
  }
}

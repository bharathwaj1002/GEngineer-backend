import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { EvaluationsService } from './evaluations.service';
import { UpsertEvaluationDto } from './dto/upsert-evaluation.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/submissions/:assignmentId/evaluation')
export class EvaluationsController {
  constructor(private evaluationsService: EvaluationsService) {}

  @Get()
  get(@Param('assignmentId') assignmentId: string) {
    return this.evaluationsService.get(assignmentId);
  }

  @Patch()
  upsert(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpsertEvaluationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.evaluationsService.upsert(assignmentId, dto, user.id);
  }

  @Patch('unlock')
  unlock(@Param('assignmentId') assignmentId: string) {
    return this.evaluationsService.unlock(assignmentId);
  }
}

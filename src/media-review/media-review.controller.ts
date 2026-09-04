import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { MediaReviewService } from './media-review.service';
import { UpsertMediaReviewDto } from './dto/upsert-media-review.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/submissions/:assignmentId/media-review')
export class MediaReviewController {
  constructor(private mediaReviewService: MediaReviewService) {}

  @Get()
  get(@Param('assignmentId') assignmentId: string) {
    return this.mediaReviewService.get(assignmentId);
  }

  @Patch()
  upsert(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpsertMediaReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mediaReviewService.upsert(assignmentId, dto, user.id);
  }
}

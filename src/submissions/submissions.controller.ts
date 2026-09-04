import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OwnRowGuard } from '../common/guards/own-row.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { SubmissionsService } from './submissions.service';
import { PatchAnswersDto } from './dto/patch-answers.dto';
import { AddRowDto, UpdateRowDto } from './dto/row.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CANDIDATE)
@Controller('me')
export class MySubmissionController {
  constructor(private submissionsService: SubmissionsService) {}

  @Get('assignment')
  getAssignment(@CurrentUser() user: AuthenticatedUser) {
    return this.submissionsService.getMyAssignment(user.id);
  }

  @Get('submission')
  getSubmission(@CurrentUser() user: AuthenticatedUser) {
    return this.submissionsService.getMySubmission(user.id);
  }

  @Patch('submission/answers')
  patchAnswers(@CurrentUser() user: AuthenticatedUser, @Body() dto: PatchAnswersDto) {
    return this.submissionsService.patchAnswers(user.id, dto.answers);
  }

  @Post('submission/sections/:sectionId/rows')
  addRow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sectionId') sectionId: string,
    @Body() dto: AddRowDto,
  ) {
    return this.submissionsService.addRow(user.id, sectionId, dto.data);
  }

  @UseGuards(OwnRowGuard)
  @Patch('submission/rows/:rowId')
  updateRow(@Param('rowId') rowId: string, @Body() dto: UpdateRowDto, @Req() req: any) {
    return this.submissionsService.updateRow(req.rowType, rowId, dto.data);
  }

  @UseGuards(OwnRowGuard)
  @Delete('submission/rows/:rowId')
  deleteRow(@Param('rowId') rowId: string, @Req() req: any) {
    return this.submissionsService.deleteRow(req.rowType, rowId);
  }

  @Post('submission/submit')
  submit(@CurrentUser() user: AuthenticatedUser) {
    return this.submissionsService.submitFinal(user.id);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/submissions')
export class AdminSubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  @Get(':id')
  getOne(@Param('id') assignmentId: string) {
    return this.submissionsService.getFullForAdmin(assignmentId);
  }
}

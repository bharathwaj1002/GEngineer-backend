import { Module } from '@nestjs/common';
import { MySubmissionController, AdminSubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { OwnRowGuard } from '../common/guards/own-row.guard';

@Module({
  controllers: [MySubmissionController, AdminSubmissionsController],
  providers: [SubmissionsService, OwnRowGuard],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}

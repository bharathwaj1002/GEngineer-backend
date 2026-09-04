import { Module } from '@nestjs/common';
import { MediaReviewController } from './media-review.controller';
import { MediaReviewService } from './media-review.service';

@Module({
  controllers: [MediaReviewController],
  providers: [MediaReviewService],
})
export class MediaReviewModule {}

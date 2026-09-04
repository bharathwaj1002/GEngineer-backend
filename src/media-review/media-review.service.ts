import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpsertMediaReviewDto } from './dto/upsert-media-review.dto';

@Injectable()
export class MediaReviewService {
  constructor(private prisma: PrismaService) {}

  private async getSubmissionIdForAssignment(assignmentId: string): Promise<string> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { submission: true },
    });
    if (!assignment?.submission) throw new NotFoundException('Submission not found for this assignment');
    return assignment.submission.id;
  }

  async get(assignmentId: string) {
    const submissionId = await this.getSubmissionIdForAssignment(assignmentId);
    return this.prisma.mediaReview.findUnique({ where: { submissionId } });
  }

  async upsert(assignmentId: string, dto: UpsertMediaReviewDto, reviewedByUserId: string) {
    const submissionId = await this.getSubmissionIdForAssignment(assignmentId);
    return this.prisma.mediaReview.upsert({
      where: { submissionId },
      create: { submissionId, ...dto, reviewedByUserId },
      update: { ...dto, reviewedByUserId },
    });
  }
}

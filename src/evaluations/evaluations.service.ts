import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpsertEvaluationDto } from './dto/upsert-evaluation.dto';

@Injectable()
export class EvaluationsService {
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
    return this.prisma.evaluation.findUnique({ where: { submissionId } });
  }

  async upsert(assignmentId: string, dto: UpsertEvaluationDto, evaluatedByUserId: string) {
    const submissionId = await this.getSubmissionIdForAssignment(assignmentId);

    const existing = await this.prisma.evaluation.findUnique({ where: { submissionId } });
    if (existing?.isFinal) {
      throw new ConflictException('This evaluation was marked final and can no longer be edited.');
    }

    const evaluation = await this.prisma.evaluation.upsert({
      where: { submissionId },
      create: { submissionId, ...dto, evaluatedByUserId },
      update: { ...dto, evaluatedByUserId },
    });

    if (dto.isFinal) {
      await this.prisma.assignment.updateMany({
        where: { submission: { id: submissionId } },
        data: { status: 'EVALUATED' },
      });
    }

    return evaluation;
  }

  async unlock(assignmentId: string) {
    const submissionId = await this.getSubmissionIdForAssignment(assignmentId);
    const existing = await this.prisma.evaluation.findUnique({ where: { submissionId } });
    if (!existing) throw new NotFoundException('Evaluation not found');

    return this.prisma.evaluation.update({
      where: { submissionId },
      data: { isFinal: false },
    });
  }
}

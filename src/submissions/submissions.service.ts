import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RowKind } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { computeProgress } from './progress.util';
import { getLinkListIds, getRepeatableSectionIds, getTaskDefinition, TrackDefinition } from '../tasks/definitions';

function linkItemToData(row: { title: string | null; linkType: string | null; url: string | null; note: string | null }) {
  return { title: row.title ?? '', type: row.linkType ?? '', url: row.url ?? '', note: row.note ?? '' };
}

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  private async getCandidateByUserId(userId: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) throw new NotFoundException('Candidate profile not found');
    return candidate;
  }

  private async getLatestAssignment(userId: string) {
    const candidate = await this.getCandidateByUserId(userId);
    const assignment = await this.prisma.assignment.findFirst({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: 'desc' },
      include: { submission: true, candidate: true },
    });
    if (!assignment) throw new NotFoundException('No assignment found for this candidate');
    return assignment;
  }

  private async getOwnSubmissionRaw(userId: string) {
    const assignment = await this.getLatestAssignment(userId);
    if (!assignment.submission) throw new NotFoundException('No submission found for this assignment');
    return { assignment, submission: assignment.submission };
  }

  private buildProgress(def: TrackDefinition, answers: Record<string, unknown>, repeatableRows: { sectionId: string; data: any }[]) {
    const repeatableIds = getRepeatableSectionIds(def);
    const counts: Record<string, number> = {};
    for (const sid of repeatableIds) {
      const rowsForSection = repeatableRows.filter((r) => r.sectionId === sid);
      const sec = def.sections.find((s) => s.id === sid);
      if (sec && sec.kind === 'repeatable') {
        const firstCol = sec.columns[0].id;
        counts[sid] = rowsForSection.filter((r) => {
          const v = (r.data as any)?.[firstCol];
          return typeof v === 'string' ? v.trim().length > 0 : !!v;
        }).length;
      }
    }
    return computeProgress(def, answers, counts);
  }

  async getMyAssignment(userId: string) {
    const assignment = await this.getLatestAssignment(userId);
    return assignment;
  }

  async getMySubmission(userId: string) {
    const { assignment, submission } = await this.getOwnSubmissionRaw(userId);
    const def = getTaskDefinition(assignment.taskVersion);
    if (!def) throw new BadRequestException('Unknown task version for this assignment');

    const [repeatableRows, linkItems] = await Promise.all([
      this.prisma.repeatableRow.findMany({ where: { submissionId: submission.id }, orderBy: { order: 'asc' } }),
      this.prisma.linkItem.findMany({ where: { submissionId: submission.id }, orderBy: { order: 'asc' } }),
    ]);

    const progress = this.buildProgress(def, submission.answers as Record<string, unknown>, repeatableRows);

    return {
      id: submission.id,
      assignmentId: assignment.id,
      taskVersion: assignment.taskVersion,
      status: assignment.status,
      deadline: assignment.deadline,
      startDate: assignment.startDate,
      startTime: assignment.startTime,
      submittedAt: submission.submittedAt,
      answers: submission.answers,
      repeatableRows: repeatableRows.map((r) => ({ id: r.id, sectionId: r.sectionId, order: r.order, data: r.data })),
      linkItems: linkItems.map((r) => ({ id: r.id, sectionId: r.sectionId, order: r.order, data: linkItemToData(r) })),
      progress,
    };
  }

  async patchAnswers(userId: string, partial: Record<string, unknown>) {
    const { assignment, submission } = await this.getOwnSubmissionRaw(userId);
    if (assignment.status === 'SUBMITTED' || assignment.status === 'UNDER_REVIEW' || assignment.status === 'EVALUATED') {
      throw new ConflictException('This assessment has already been submitted and can no longer be edited');
    }

    const merged = { ...(submission.answers as Record<string, unknown>), ...partial };

    const updates: any = { answers: merged };
    if (!assignment.actualStartedAt) {
      await this.prisma.assignment.update({
        where: { id: assignment.id },
        data: { actualStartedAt: new Date(), status: 'IN_PROGRESS' },
      });
    }

    const updated = await this.prisma.submission.update({ where: { id: submission.id }, data: updates });
    return { answers: updated.answers };
  }

  async addRow(userId: string, sectionId: string, data: Record<string, unknown> | undefined) {
    const { assignment, submission } = await this.getOwnSubmissionRaw(userId);
    if (assignment.status !== 'SCHEDULED' && assignment.status !== 'IN_PROGRESS') {
      throw new ConflictException('This assessment has already been submitted and can no longer be edited');
    }
    const def = getTaskDefinition(assignment.taskVersion)!;
    const isLinkList = getLinkListIds(def).includes(sectionId);
    const isRepeatable = getRepeatableSectionIds(def).includes(sectionId);
    if (!isLinkList && !isRepeatable) throw new BadRequestException('Unknown section');

    if (isLinkList) {
      const maxOrder = await this.prisma.linkItem.aggregate({
        where: { submissionId: submission.id, sectionId },
        _max: { order: true },
      });
      const row = await this.prisma.linkItem.create({
        data: {
          submissionId: submission.id,
          sectionId,
          order: (maxOrder._max.order ?? -1) + 1,
          title: (data?.title as string) ?? '',
          linkType: (data?.type as string) ?? '',
          url: (data?.url as string) ?? '',
          note: (data?.note as string) ?? '',
        },
      });
      return { id: row.id, sectionId, order: row.order, data: linkItemToData(row) };
    }

    const maxOrder = await this.prisma.repeatableRow.aggregate({
      where: { submissionId: submission.id, sectionId },
      _max: { order: true },
    });
    const row = await this.prisma.repeatableRow.create({
      data: {
        submissionId: submission.id,
        sectionId,
        kind: RowKind.REPEATABLE,
        order: (maxOrder._max.order ?? -1) + 1,
        data: (data ?? {}) as Prisma.InputJsonValue,
      },
    });
    return { id: row.id, sectionId, order: row.order, data: row.data };
  }

  async updateRow(rowType: 'REPEATABLE' | 'LINK', rowId: string, data: Record<string, unknown>) {
    if (rowType === 'LINK') {
      const row = await this.prisma.linkItem.update({
        where: { id: rowId },
        data: {
          title: (data.title as string) ?? undefined,
          linkType: (data.type as string) ?? undefined,
          url: (data.url as string) ?? undefined,
          note: (data.note as string) ?? undefined,
        },
      });
      return { id: row.id, sectionId: row.sectionId, order: row.order, data: linkItemToData(row) };
    }
    const row = await this.prisma.repeatableRow.update({
      where: { id: rowId },
      data: { data: data as Prisma.InputJsonValue },
    });
    return { id: row.id, sectionId: row.sectionId, order: row.order, data: row.data };
  }

  async deleteRow(rowType: 'REPEATABLE' | 'LINK', rowId: string) {
    if (rowType === 'LINK') {
      await this.prisma.linkItem.delete({ where: { id: rowId } });
    } else {
      await this.prisma.repeatableRow.delete({ where: { id: rowId } });
    }
    return { success: true };
  }

  async submitFinal(userId: string) {
    const { assignment, submission } = await this.getOwnSubmissionRaw(userId);
    if (assignment.status === 'SUBMITTED' || assignment.status === 'UNDER_REVIEW' || assignment.status === 'EVALUATED') {
      throw new ConflictException('This assessment has already been submitted');
    }
    const now = new Date();
    await this.prisma.submission.update({ where: { id: submission.id }, data: { submittedAt: now } });
    const updated = await this.prisma.assignment.update({
      where: { id: assignment.id },
      data: { status: 'SUBMITTED', actualSubmittedAt: now },
    });
    return { status: updated.status, submittedAt: now };
  }

  // ---- Admin ----

  async getFullForAdmin(assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { candidate: { include: { user: true } }, submission: true },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (!assignment.submission) throw new NotFoundException('No submission for this assignment');

    const def = getTaskDefinition(assignment.taskVersion);
    const [repeatableRows, linkItems, mediaReview, evaluation] = await Promise.all([
      this.prisma.repeatableRow.findMany({ where: { submissionId: assignment.submission.id }, orderBy: { order: 'asc' } }),
      this.prisma.linkItem.findMany({ where: { submissionId: assignment.submission.id }, orderBy: { order: 'asc' } }),
      this.prisma.mediaReview.findUnique({ where: { submissionId: assignment.submission.id } }),
      this.prisma.evaluation.findUnique({ where: { submissionId: assignment.submission.id } }),
    ]);

    const progress = def ? this.buildProgress(def, assignment.submission.answers as Record<string, unknown>, repeatableRows) : 0;

    return {
      assignment: {
        id: assignment.id,
        track: assignment.track,
        taskVersion: assignment.taskVersion,
        status: assignment.status,
        startDate: assignment.startDate,
        startTime: assignment.startTime,
        deadline: assignment.deadline,
        actualStartedAt: assignment.actualStartedAt,
        actualSubmittedAt: assignment.actualSubmittedAt,
        notes: assignment.notes,
      },
      candidate: {
        id: assignment.candidate.id,
        candidateId: assignment.candidate.candidateId,
        fullName: assignment.candidate.fullName,
        email: assignment.candidate.user.email,
      },
      submission: {
        id: assignment.submission.id,
        answers: assignment.submission.answers,
        submittedAt: assignment.submission.submittedAt,
        repeatableRows: repeatableRows.map((r) => ({ id: r.id, sectionId: r.sectionId, order: r.order, data: r.data })),
        linkItems: linkItems.map((r) => ({ id: r.id, sectionId: r.sectionId, order: r.order, data: linkItemToData(r) })),
      },
      mediaReview,
      evaluation,
      progress,
    };
  }
}

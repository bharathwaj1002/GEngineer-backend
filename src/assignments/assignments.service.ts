import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { LATEST_VERSION_BY_TRACK, getTaskDefinition } from '../tasks/definitions';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id: dto.candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const taskVersion = dto.taskVersion ?? LATEST_VERSION_BY_TRACK[dto.track];
    if (!getTaskDefinition(taskVersion)) {
      throw new BadRequestException(`Unknown task version: ${taskVersion}`);
    }

    return this.prisma.assignment.create({
      data: {
        candidateId: dto.candidateId,
        track: dto.track,
        taskVersion,
        startDate: new Date(dto.startDate),
        startTime: dto.startTime,
        deadline: new Date(dto.deadline),
        notes: dto.notes,
        submission: { create: { answers: {} } },
      },
      include: { candidate: { include: { user: true } }, submission: true },
    });
  }

  async findAll(params: { track?: string; status?: string }) {
    return this.prisma.assignment.findMany({
      where: {
        track: params.track as any,
        status: params.status as any,
      },
      include: { candidate: { include: { user: true } }, submission: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { candidate: { include: { user: true } }, submission: true },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    await this.findOne(id);
    return this.prisma.assignment.update({
      where: { id },
      data: {
        ...(dto.track && { track: dto.track }),
        ...(dto.taskVersion && { taskVersion: dto.taskVersion }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.startTime && { startTime: dto.startTime }),
        ...(dto.deadline && { deadline: new Date(dto.deadline) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status && { status: dto.status }),
      },
      include: { candidate: { include: { user: true } }, submission: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.assignment.delete({ where: { id } });
    return { success: true };
  }
}

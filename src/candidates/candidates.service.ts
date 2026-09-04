import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

function toPublicCandidate(candidate: any) {
  return {
    id: candidate.id,
    candidateId: candidate.candidateId,
    fullName: candidate.fullName,
    email: candidate.user?.email,
    phone: candidate.phone,
    roleTitle: candidate.roleTitle,
    department: candidate.department,
    experience: candidate.experience,
    notes: candidate.notes,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    assignments: candidate.assignments,
  };
}

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
  ) {}

  private async nextCandidateCode(): Promise<string> {
    const count = await this.prisma.candidate.count();
    return `GE-CAND-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateCandidateDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const tempPassword = this.users.generateTempPassword();
    const candidateId = await this.nextCandidateCode();

    const candidate = await this.prisma.$transaction(async (tx) => {
      const passwordHash = await this.users.hashPassword(tempPassword);
      const user = await tx.user.create({
        data: { email: dto.email, passwordHash, role: Role.CANDIDATE },
      });
      return tx.candidate.create({
        data: {
          userId: user.id,
          candidateId,
          fullName: dto.fullName,
          phone: dto.phone,
          roleTitle: dto.roleTitle,
          department: dto.department,
          experience: dto.experience,
          notes: dto.notes,
        },
        include: { user: true, assignments: true },
      });
    });

    return { ...toPublicCandidate(candidate), tempPassword };
  }

  async findAll(params: { search?: string; status?: string; track?: string }) {
    const candidates = await this.prisma.candidate.findMany({
      where: params.search
        ? {
            OR: [
              { fullName: { contains: params.search, mode: 'insensitive' } },
              { candidateId: { contains: params.search, mode: 'insensitive' } },
              { user: { email: { contains: params.search, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      include: {
        user: true,
        assignments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return candidates
      .filter((c) => {
        if (params.track && c.assignments[0]?.track !== params.track) return false;
        if (params.status && c.assignments[0]?.status !== params.status) return false;
        return true;
      })
      .map(toPublicCandidate);
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: { user: true, assignments: { orderBy: { createdAt: 'desc' } } },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return toPublicCandidate(candidate);
  }

  async update(id: string, dto: UpdateCandidateDto) {
    await this.findOne(id);
    const candidate = await this.prisma.candidate.update({
      where: { id },
      data: dto,
      include: { user: true, assignments: true },
    });
    return toPublicCandidate(candidate);
  }

  async remove(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found');
    // Delete the User, not the Candidate directly — Candidate cascades from User,
    // which also cascades assignments/submissions/etc, and frees the email for reuse.
    await this.prisma.user.delete({ where: { id: candidate.userId } });
    return { success: true };
  }

  async resetCredentials(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found');
    const tempPassword = this.users.generateTempPassword();
    await this.users.setPassword(candidate.userId, tempPassword);
    return { tempPassword };
  }
}

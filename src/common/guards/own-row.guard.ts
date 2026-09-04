import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Guards /me/submission/rows/:rowId (repeatable + link rows share the same id space
 * conceptually but live in two tables — we check both). 404s rather than 403s on a
 * mismatch so a candidate probing another candidate's row ids can't distinguish
 * "not yours" from "doesn't exist".
 */
@Injectable()
export class OwnRowGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const rowId: string = request.params.rowId;

    const repeatable = await this.prisma.repeatableRow.findUnique({
      where: { id: rowId },
      include: { submission: { include: { assignment: { include: { candidate: true } } } } },
    });
    const row = repeatable ?? (await this.prisma.linkItem.findUnique({
      where: { id: rowId },
      include: { submission: { include: { assignment: { include: { candidate: true } } } } },
    }));

    if (!row || row.submission.assignment.candidate.userId !== user.id) {
      throw new NotFoundException('Row not found');
    }
    request.row = row;
    request.rowType = repeatable ? 'REPEATABLE' : 'LINK';
    return true;
  }
}

import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  generateTempPassword(): string {
    return randomBytes(9).toString('base64url');
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async createUser(email: string, password: string, role: Role) {
    const passwordHash = await this.hashPassword(password);
    return this.prisma.user.create({ data: { email, passwordHash, role } });
  }

  async setPassword(userId: string, password: string) {
    const passwordHash = await this.hashPassword(password);
    return this.prisma.user.update({ where: { id: userId }, data: { passwordHash, refreshTokenHash: null } });
  }
}

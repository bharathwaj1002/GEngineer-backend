import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../common/prisma/prisma.service';
import { AccessTokenPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    return user;
  }

  private signAccessToken(payload: AccessTokenPayload) {
    return this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TTL'),
    });
  }

  private signRefreshToken(payload: AccessTokenPayload) {
    return this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_TTL'),
    });
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);
    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash } });
    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken: string) {
    let payload: AccessTokenPayload;
    try {
      payload = this.jwt.verify(refreshToken, { secret: this.config.get<string>('JWT_REFRESH_SECRET') });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash || !(await argon2.verify(user.refreshTokenHash, refreshToken))) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const newPayload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.signAccessToken(newPayload);
    const newRefreshToken = this.signRefreshToken(newPayload);
    const refreshTokenHash = await argon2.hash(newRefreshToken);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash } });
    return { accessToken, refreshToken: newRefreshToken, user };
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { candidate: true },
    });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      candidate: user.candidate
        ? {
            id: user.candidate.id,
            candidateId: user.candidate.candidateId,
            fullName: user.candidate.fullName,
            phone: user.candidate.phone,
            roleTitle: user.candidate.roleTitle,
            department: user.candidate.department,
            experience: user.candidate.experience,
          }
        : null,
    };
  }
}

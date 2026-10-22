import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { Response } from 'express';

import { getAuthCookieOptions, parseDurationToMs } from './auth.helper.js';
import type { AuthenticatedUser } from './current-user.decorator.js';
import type { LoginDto } from './dto/login.dto.js';
import { AuditService } from '../audit/audit.service.js';
import { ENV } from '../config/config.module.js';
import type { Env } from '../config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';

const DUMMY_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$S0oHNCUMa3f7xlEUPRGY8g$F7VQPSTehNWMYa8f7LOqrZURm3PV7PbG3Du8AM5jp4o';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    @Inject(ENV) private readonly env: Env,
  ) {}

  async login(dto: LoginDto, res: Response): Promise<AuthenticatedUser> {
    const user = await this.prisma.client.user.findFirst({
      where: { email: { equals: dto.email, mode: 'insensitive' } },
    });

    if (!user) {
      await argon2.verify(DUMMY_HASH, dto.password);
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid || !user.isActive) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    const maxAge = parseDurationToMs(this.env.JWT_EXPIRES_IN);

    res.cookie(this.env.AUTH_COOKIE_NAME, token, {
      ...getAuthCookieOptions(this.env),
      maxAge,
    });

    await this.auditService.log({
      action: 'auth.login',
      entity: 'User',
      entityId: user.id,
      userId: user.id,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  logout(res: Response): void {
    res.clearCookie(this.env.AUTH_COOKIE_NAME, getAuthCookieOptions(this.env));
  }

  async validateToken(token: string): Promise<AuthenticatedUser> {
    let payload: { sub: string; role: string };
    try {
      payload = this.jwtService.verify<{ sub: string; role: string }>(token);
    } catch {
      throw new UnauthorizedException('Sesi tidak valid');
    }

    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Sesi tidak valid');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

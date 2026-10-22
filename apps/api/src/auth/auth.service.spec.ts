import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { Env } from '../config/env.js';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwt: any;
  let mockAudit: any;
  let env: Env;
  let mockResponse: any;

  beforeEach(async () => {
    mockPrisma = {
      client: {
        user: {
          findFirst: vi.fn(),
          findUnique: vi.fn(),
        },
      },
    };
    mockJwt = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn(),
    };
    mockAudit = {
      log: vi.fn().mockResolvedValue(undefined),
    };
    env = {
      NODE_ENV: 'test',
      API_PORT: 4000,
      WEB_ORIGIN: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://dummy',
      JWT_SECRET: 'super_secret_jwt_key_karate_club_dev_min_32_chars',
      JWT_EXPIRES_IN: '8h',
      AUTH_COOKIE_NAME: 'karate_session',
      SUPERADMIN_NAME: 'Super Admin',
    };
    mockResponse = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };

    service = new AuthService(mockPrisma, mockJwt, mockAudit, env);
  });

  describe('login', () => {
    const validDto: LoginDto = {
      email: 'admin@karate.local',
      password: 'password123',
    };

    it('berhasil login: set cookie dan catat audit log', async () => {
      const passwordHash = await argon2.hash('password123');
      mockPrisma.client.user.findFirst.mockResolvedValue({
        id: 'user-1',
        name: 'Super Admin',
        email: 'admin@karate.local',
        passwordHash,
        role: 'SUPERADMIN',
        isActive: true,
      });

      const result = await service.login(validDto, mockResponse);

      expect(result).toEqual({
        id: 'user-1',
        name: 'Super Admin',
        email: 'admin@karate.local',
        role: 'SUPERADMIN',
      });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'karate_session',
        'mock-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          path: '/',
        }),
      );
      expect(mockAudit.log).toHaveBeenCalledWith({
        action: 'auth.login',
        entity: 'User',
        entityId: 'user-1',
        userId: 'user-1',
      });
    });

    it('gagal bila email tidak terdaftar: lempar UnauthorizedException dengan pesan generik', async () => {
      mockPrisma.client.user.findFirst.mockResolvedValue(null);

      await expect(service.login(validDto, mockResponse)).rejects.toThrow(
        new UnauthorizedException('Email atau password salah'),
      );
      expect(mockResponse.cookie).not.toHaveBeenCalled();
      expect(mockAudit.log).not.toHaveBeenCalled();
    });

    it('gagal bila password salah: lempar UnauthorizedException dengan pesan generik', async () => {
      const wrongHash = await argon2.hash('other-password');
      mockPrisma.client.user.findFirst.mockResolvedValue({
        id: 'user-1',
        name: 'Super Admin',
        email: 'admin@karate.local',
        passwordHash: wrongHash,
        role: 'SUPERADMIN',
        isActive: true,
      });

      await expect(service.login(validDto, mockResponse)).rejects.toThrow(
        new UnauthorizedException('Email atau password salah'),
      );
    });

    it('gagal bila user non-aktif: lempar UnauthorizedException dengan pesan generik', async () => {
      const passwordHash = await argon2.hash('password123');
      mockPrisma.client.user.findFirst.mockResolvedValue({
        id: 'user-1',
        name: 'Super Admin',
        email: 'admin@karate.local',
        passwordHash,
        role: 'SUPERADMIN',
        isActive: false,
      });

      await expect(service.login(validDto, mockResponse)).rejects.toThrow(
        new UnauthorizedException('Email atau password salah'),
      );
    });
  });

  describe('logout', () => {
    it('menghapus cookie sesi', () => {
      service.logout(mockResponse);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'karate_session',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );
    });
  });

  describe('validateToken', () => {
    it('mengembalikan data user bila token valid dan user aktif', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-1', role: 'SUPERADMIN' });
      mockPrisma.client.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Super Admin',
        email: 'admin@karate.local',
        role: 'SUPERADMIN',
        isActive: true,
      });

      const user = await service.validateToken('valid-token');
      expect(user).toEqual({
        id: 'user-1',
        name: 'Super Admin',
        email: 'admin@karate.local',
        role: 'SUPERADMIN',
      });
    });

    it('gagal bila jwt tidak valid', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.validateToken('bad-token')).rejects.toThrow(
        new UnauthorizedException('Sesi tidak valid'),
      );
    });

    it('gagal bila user di database tidak ditemukan atau tidak aktif', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-1', role: 'SUPERADMIN' });
      mockPrisma.client.user.findUnique.mockResolvedValue(null);

      await expect(service.validateToken('valid-token')).rejects.toThrow(
        new UnauthorizedException('Sesi tidak valid'),
      );
    });
  });
});

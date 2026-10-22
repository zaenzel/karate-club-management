import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockReflector: any;
  let mockAuthService: any;
  let env: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: vi.fn(),
    };
    mockAuthService = {
      validateToken: vi.fn(),
    };
    env = {
      AUTH_COOKIE_NAME: 'karate_session',
    };

    guard = new JwtAuthGuard(mockReflector, mockAuthService, env);
  });

  function createMockContext(cookies?: Record<string, string>, req: any = {}) {
    req.cookies = cookies;
    return {
      getHandler: () => vi.fn(),
      getClass: () => vi.fn(),
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any;
  }

  it('mengizinkan route yang memiliki decorator @Public()', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const ctx = createMockContext();

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockAuthService.validateToken).not.toHaveBeenCalled();
  });

  it('menolak bila tidak ada cookie sesi', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const ctx = createMockContext({});

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException('Sesi tidak ditemukan'),
    );
  });

  it('menolak bila token cookie tidak valid', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockAuthService.validateToken.mockRejectedValue(new Error('Invalid token'));
    const ctx = createMockContext({ karate_session: 'bad-token' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException('Sesi tidak valid'),
    );
  });

  it('mengizinkan dan mengisi req.user bila token valid', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const user = { id: 'user-1', name: 'Admin', email: 'admin@karate.local', role: 'SUPERADMIN' };
    mockAuthService.validateToken.mockResolvedValue(user);

    const req: any = {};
    const ctx = createMockContext({ karate_session: 'valid-token' }, req);

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(req.user).toEqual(user);
  });
});

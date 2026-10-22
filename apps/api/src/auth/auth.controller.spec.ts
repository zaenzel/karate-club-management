import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthController } from './auth.controller.js';
import type { LoginDto } from './dto/login.dto.js';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;
  let mockRes: any;

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn(),
      logout: vi.fn(),
    };
    mockRes = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };
    controller = new AuthController(mockAuthService);
  });

  it('memanggil authService.login saat login', async () => {
    const dto: LoginDto = { email: 'admin@karate.local', password: 'password123' };
    const user = { id: 'user-1', name: 'Admin', email: 'admin@karate.local', role: 'SUPERADMIN' };
    mockAuthService.login.mockResolvedValue(user);

    const result = await controller.login(dto, mockRes);
    expect(result).toEqual(user);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto, mockRes);
  });

  it('memanggil authService.logout saat logout', () => {
    controller.logout(mockRes);
    expect(mockAuthService.logout).toHaveBeenCalledWith(mockRes);
  });

  it('mengembalikan data currentUser saat me() dipanggil', () => {
    const user = { id: 'user-1', name: 'Admin', email: 'admin@karate.local', role: 'SUPERADMIN' };
    const result = controller.me(user);
    expect(result).toEqual(user);
  });
});

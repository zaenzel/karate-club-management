import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { NotFoundException } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import type { Env } from '../config/env.js';

// Mock getSignedUrl from @aws-sdk/s3-request-presigner
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(async (_client, command, options) => {
    return `http://localhost:9000/${command.input.Bucket}/${command.input.Key}?expiresIn=${options?.expiresIn}&disposition=${encodeURIComponent(command.input.ResponseContentDisposition || '')}`;
  }),
}));

describe('StorageService', () => {
  let service: StorageService;
  let mockS3Client: { send: ReturnType<typeof vi.fn> };
  let mockEnv: Env;

  beforeEach(() => {
    mockS3Client = {
      send: vi.fn(),
    };
    mockEnv = {
      NODE_ENV: 'test',
      API_PORT: 4000,
      WEB_ORIGIN: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://dummy',
      JWT_SECRET: 'super_secret_jwt_key_karate_club_dev_min_32_chars',
      JWT_EXPIRES_IN: '8h',
      AUTH_COOKIE_NAME: 'karate_session',
      SUPERADMIN_NAME: 'Super Admin',
      S3_ENDPOINT: 'http://localhost:9000',
      S3_BUCKET: 'karate-files',
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY: 'minio',
      S3_SECRET_KEY: 'minio_dev_password',
      S3_FORCE_PATH_STYLE: true,
      S3_PRESIGN_TTL_SECONDS: 300,
      REDIS_URL: 'redis://localhost:6379',
    };
    service = new StorageService(mockEnv, mockS3Client as unknown as S3Client);
  });

  describe('putObject', () => {
    it('mengirim PutObjectCommand dengan key, body, dan contentType yang benar', async () => {
      mockS3Client.send.mockResolvedValueOnce({});

      const body = Buffer.from('test content');
      await service.putObject('test/path.pdf', body, 'application/pdf');

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      const command = mockS3Client.send.mock.calls[0][0];
      expect(command).toBeInstanceOf(PutObjectCommand);
      expect(command.input.Key).toBe('test/path.pdf');
      expect(command.input.Body).toEqual(body);
      expect(command.input.ContentType).toBe('application/pdf');
    });
  });

  describe('getObject', () => {
    it('mengembalikan Buffer saat objek ditemukan', async () => {
      const content = Buffer.from('file-bytes');
      mockS3Client.send.mockResolvedValueOnce({
        Body: {
          transformToByteArray: async () => new Uint8Array(content),
        },
      });

      const result = await service.getObject('test/file.png');
      expect(result).toEqual(content);
      const command = mockS3Client.send.mock.calls[0][0];
      expect(command).toBeInstanceOf(GetObjectCommand);
      expect(command.input.Key).toBe('test/file.png');
    });

    it('melempar NotFoundException saat NoSuchKey', async () => {
      const error = new Error('The specified key does not exist.');
      error.name = 'NoSuchKey';
      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(service.getObject('not-found.pdf')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteObject', () => {
    it('mengirim DeleteObjectCommand dengan key yang benar', async () => {
      mockS3Client.send.mockResolvedValueOnce({});

      await service.deleteObject('to-delete.pdf');
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      const command = mockS3Client.send.mock.calls[0][0];
      expect(command).toBeInstanceOf(DeleteObjectCommand);
      expect(command.input.Key).toBe('to-delete.pdf');
    });
  });

  describe('exists', () => {
    it('mengembalikan true jika HeadObject sukses', async () => {
      mockS3Client.send.mockResolvedValueOnce({});

      const exists = await service.exists('exists.pdf');
      expect(exists).toBe(true);
      const command = mockS3Client.send.mock.calls[0][0];
      expect(command).toBeInstanceOf(HeadObjectCommand);
    });

    it('mengembalikan false jika NotFound atau NoSuchKey', async () => {
      const error = new Error('NotFound');
      error.name = 'NotFound';
      mockS3Client.send.mockRejectedValueOnce(error);

      const exists = await service.exists('missing.pdf');
      expect(exists).toBe(false);
    });
  });

  describe('getPresignedDownloadUrl', () => {
    it('membuat presigned URL dengan TTL default dan ResponseContentDisposition attachment', async () => {
      const url = await service.getPresignedDownloadUrl('certificates/2026/cert-1.pdf', {
        filename: 'C202600001.pdf',
      });

      expect(url).toContain('certificates/2026/cert-1.pdf');
      expect(url).toContain('expiresIn=300');
      expect(url).toContain('attachment');
      expect(url).toContain('C202600001.pdf');
    });
  });
});

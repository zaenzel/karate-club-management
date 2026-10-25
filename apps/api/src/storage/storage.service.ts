import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { ENV } from '../config/config.module.js';
import type { Env } from '../config/env.js';

export interface PresignedUrlOptions {
  filename?: string;
  ttlSeconds?: number;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly defaultTtlSeconds: number;
  private readonly endpoint: string;
  private readonly publicEndpoint?: string;

  constructor(@Inject(ENV) env: Env, @Optional() customClient?: S3Client) {
    this.bucket = env.S3_BUCKET;
    this.defaultTtlSeconds = env.S3_PRESIGN_TTL_SECONDS;
    this.endpoint = env.S3_ENDPOINT;
    this.publicEndpoint = env.S3_PUBLIC_ENDPOINT;

    this.client =
      customClient ??
      new S3Client({
        endpoint: env.S3_ENDPOINT,
        region: env.S3_REGION,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY,
          secretAccessKey: env.S3_SECRET_KEY,
        },
        forcePathStyle: env.S3_FORCE_PATH_STYLE,
      });
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async getObject(key: string): Promise<Buffer> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      if (!response.Body) {
        throw new NotFoundException('File tidak ditemukan');
      }

      const bytes = await response.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (err: unknown) {
      const e = err as { name?: string; Code?: string; code?: string };
      if (
        e.name === 'NoSuchKey' ||
        e.name === 'NotFound' ||
        e.Code === 'NoSuchKey' ||
        e.code === 'NoSuchKey'
      ) {
        throw new NotFoundException('File tidak ditemukan');
      }
      throw err;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (err: unknown) {
      const e = err as {
        name?: string;
        Code?: string;
        code?: string;
        $metadata?: { httpStatusCode?: number };
      };
      if (
        e.name === 'NoSuchKey' ||
        e.name === 'NotFound' ||
        e.Code === 'NoSuchKey' ||
        e.code === 'NoSuchKey' ||
        e.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw err;
    }
  }

  async getPresignedDownloadUrl(key: string, options?: PresignedUrlOptions): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ...(options?.filename
        ? { ResponseContentDisposition: `attachment; filename="${options.filename}"` }
        : {}),
    });

    let url = await getSignedUrl(this.client, command, {
      expiresIn: options?.ttlSeconds ?? this.defaultTtlSeconds,
    });

    if (this.publicEndpoint && this.publicEndpoint !== this.endpoint) {
      url = url.replace(this.endpoint, this.publicEndpoint);
    }

    return url;
  }
}

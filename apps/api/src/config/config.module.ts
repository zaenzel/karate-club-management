import { Global, Module } from '@nestjs/common';

import { loadEnv } from './env.js';

/** Token DI untuk env yang sudah divalidasi. Service meng-inject ini, bukan membaca process.env. */
export const ENV = Symbol('ENV');

@Global()
@Module({
  providers: [{ provide: ENV, useFactory: () => loadEnv() }],
  exports: [ENV],
})
export class ConfigModule {}

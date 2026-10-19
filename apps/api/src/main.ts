import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { loadEnv, loadRootEnvFile } from './config/env.js';

async function bootstrap() {
  loadRootEnvFile();
  const env = loadEnv();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: env.WEB_ORIGIN });

  await app.listen(env.API_PORT);
}
await bootstrap();

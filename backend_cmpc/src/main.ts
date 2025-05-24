import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:'+ process.env.FRONT_CORS_PORT, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const uploadPath = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath);
  }

  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });
  const port = process.env.APP_PORT || 3000
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);

}
bootstrap();
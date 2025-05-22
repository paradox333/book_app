// src/main.ts (de tu backend NestJS)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs'; // Importar para crear la carpeta 'uploads' si no existe

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- COMIENZO DE LA CONFIGURACIÓN CORS ---
  app.enableCors({
    origin: 'http://localhost:5173', // <--- ¡Asegúrate de que esta URL sea la de tu frontend!
                                     // Puedes usar true para permitir cualquier origen (NO RECOMENDADO EN PRODUCCIÓN)
                                     // o un array de orígenes: ['http://localhost:5173', 'https://tu-dominio-prod.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
    credentials: true, // Importante para permitir el envío de cookies o encabezados de autorización (como el JWT)
    allowedHeaders: 'Content-Type, Accept, Authorization', // Encabezados permitidos (incluye Authorization para JWT)
  });
  // --- FIN DE LA CONFIGURACIÓN CORS ---

  // Habilitar validación global para DTOs (si aún no lo tienes)
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true, // Opcional: Prohibir propiedades no definidas en DTOs
  }));

  // Asegúrate de que la carpeta 'uploads' exista
  const uploadPath = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath);
  }

  // Servir archivos estáticos (para las imágenes subidas)
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  await app.listen(3000); // El puerto en el que escucha tu backend
}
bootstrap();
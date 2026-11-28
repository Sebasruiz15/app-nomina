// archivo: apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.useGlobalFilters(new AllExceptionsFilter());

  // 1. Cabeceras HTTP de seguridad
  app.use(helmet());

  // 2. CORS: solo el frontend autorizado puede llamar a la API
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({ origin: allowedOrigins, credentials: true });

  // 3. Validación global de todo lo que entra
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Prefijo y versión de la API
  app.setGlobalPrefix('api/v1');

  // 5. Cierre ordenado (cierra conexiones a la BD al apagar)
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  logger.log(`API escuchando en el puerto ${port}`);
}

await bootstrap();
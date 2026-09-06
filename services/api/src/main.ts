import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('CSHRK-API-Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || process.env.API_PORT || 3000;
  const prefix = process.env.API_PREFIX || 'api/v1';

  // Global Routing Prefix
  app.setGlobalPrefix(prefix);

  // CORS Configuration
  const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    'http://localhost:5173,http://localhost:19006,http://localhost:8081'
  ).split(',');

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter (RFC 7807)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Transform Interceptor (Consistent Envelopes)
  app.useGlobalInterceptors(new TransformInterceptor());

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('CSHRK Platform API')
    .setDescription(
      'Cooperative Labour & Service Marketplace — Centralized Backend API Specification',
    )
    .setVersion('0.1.0 (Phase 0 Foundation)')
    .addBearerAuth()
    .addTag('Authentication & Identity')
    .addTag('System & Observability')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`=======================================================`);
  logger.log(`  CSHRK Backend API listening on port : ${port}`);
  logger.log(`  API Base URL: http://localhost:${port}/${prefix}`);
  logger.log(`  Swagger Docs: http://localhost:${port}/api/docs`);
  logger.log(`  Health Check: http://localhost:${port}/${prefix}/health`);
  logger.log(`=======================================================`);
}

bootstrap();

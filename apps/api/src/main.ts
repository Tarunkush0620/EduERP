import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3001;
  const prefix = configService.get<string>('app.prefix') || 'api/v1';

  // Global prefix
  app.setGlobalPrefix(prefix);

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation
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

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EduERP API')
    .setDescription('School Enterprise Resource Planning System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Login, refresh tokens, and profile')
    .addTag('Users', 'User management (Super Admin)')
    .addTag('Teachers', 'Teacher management')
    .addTag('Students', 'Student management')
    .addTag('Classes', 'Class and section management')
    .addTag('Attendance', 'Attendance tracking')
    .addTag('Assignments', 'Assignment management')
    .addTag('Exams', 'Examination and results')
    .addTag('Fees', 'Financial management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  await app.listen(port);

  logger.log(`🚀 EduERP API is running on: http://localhost:${port}/${prefix}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/${prefix}/docs`);
}

bootstrap();

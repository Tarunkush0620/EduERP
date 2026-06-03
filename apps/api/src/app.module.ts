import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

// Config
import { appConfig, databaseConfig, jwtConfig, redisConfig } from './config/env.config';

// Database
import { DatabaseModule } from './database/database.module';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { StudentsModule } from './modules/students/students.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { ExamsModule } from './modules/exams/exams.module';
import { FeesModule } from './modules/fees/fees.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { AiModule } from './modules/ai/ai.module';

// Common
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      envFilePath: ['.env', '../../.env'],
    }),

    // Database
    DatabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    ClassesModule,
    SubjectsModule,
    TeachersModule,
    StudentsModule,
    DashboardModule,
    AttendanceModule,
    AssignmentsModule,
    ExamsModule,
    FeesModule,
    CommunicationModule,
    AiModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global response transform
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}

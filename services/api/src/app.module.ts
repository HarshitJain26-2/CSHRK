import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './config/app.config';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { WorkerModule } from './modules/worker/worker.module';
import { SkillModule } from './modules/skill/skill.module';
import { CertificationModule } from './modules/certification/certification.module';
import { CooperativeModule } from './modules/cooperative/cooperative.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AuthModule,
    HealthModule,
    WorkerModule,
    SkillModule,
    CertificationModule,
    CooperativeModule,
  ],
})
export class AppModule {}

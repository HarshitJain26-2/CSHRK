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
import { CustomerModule } from './modules/customer/customer.module';
import { ServiceCatalogModule } from './modules/service-catalog/service-catalog.module';
import { ServiceRequestModule } from './modules/service-request/service-request.module';
import { BookingModule } from './modules/booking/booking.module';
import { AuditModule } from './modules/audit/audit.module';
import { FederationModule } from './modules/federation/federation.module';
import { TeamModule } from './modules/team/team.module';
import { OrgOperationsModule } from './modules/org-operations/org-operations.module';

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
    CustomerModule,
    ServiceCatalogModule,
    ServiceRequestModule,
    BookingModule,
    AuditModule,
    FederationModule,
    TeamModule,
    OrgOperationsModule,
  ],
})
export class AppModule {}


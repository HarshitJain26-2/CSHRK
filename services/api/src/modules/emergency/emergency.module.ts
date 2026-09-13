import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SosAlertEntity,
  SosUpdateEntity,
  BookingEntity,
  WorkerEntity,
  CustomerEntity,
  CooperativeMembershipEntity,
} from '../../database/entities';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SosAlertEntity,
      SosUpdateEntity,
      BookingEntity,
      WorkerEntity,
      CustomerEntity,
      CooperativeMembershipEntity,
    ]),
    AuditModule,
    NotificationModule,
  ],
  controllers: [SosController],
  providers: [SosService],
  exports: [SosService],
})
export class EmergencyModule {}

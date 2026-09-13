import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingEntity,
  MessageEntity,
  WorkerSupportRequestEntity,
} from '../../database/entities';
import { ResilienceService } from './resilience.service';
import { ResilienceController } from './resilience.controller';
import { CommunicationModule } from '../communication/communication.module';
import { WelfareOperationsModule } from '../welfare-operations/welfare-operations.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      MessageEntity,
      WorkerSupportRequestEntity,
    ]),
    CommunicationModule,
    WelfareOperationsModule,
    AuditModule,
  ],
  controllers: [ResilienceController],
  providers: [ResilienceService],
  exports: [ResilienceService],
})
export class ResilienceModule {}

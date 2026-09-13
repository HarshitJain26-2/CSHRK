import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  WorkerSupportRequestEntity,
  WelfareRecordEntity,
  WorkerEntity,
  CooperativeMembershipEntity,
} from '../../database/entities';
import { WelfareOperationsService } from './welfare-operations.service';
import { WelfareOperationsController } from './welfare-operations.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkerSupportRequestEntity,
      WelfareRecordEntity,
      WorkerEntity,
      CooperativeMembershipEntity,
    ]),
    AuditModule,
    NotificationModule,
  ],
  controllers: [WelfareOperationsController],
  providers: [WelfareOperationsService],
  exports: [WelfareOperationsService],
})
export class WelfareOperationsModule {}

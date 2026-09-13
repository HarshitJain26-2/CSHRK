import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ComplaintEntity,
  DisputeEntity,
  DisputeEvidenceEntity,
  AccountRestrictionEntity,
  BookingEntity,
  PaymentEntity,
  CustomerEntity,
  WorkerEntity,
  CooperativeMembershipEntity,
  UserEntity,
} from '../../database/entities';
import { ComplaintService } from './complaint.service';
import { DisputeService } from './dispute.service';
import { ModerationService } from './moderation.service';
import { TrustSafetyController } from './trust-safety.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationModule } from '../notification/notification.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComplaintEntity,
      DisputeEntity,
      DisputeEvidenceEntity,
      AccountRestrictionEntity,
      BookingEntity,
      PaymentEntity,
      CustomerEntity,
      WorkerEntity,
      CooperativeMembershipEntity,
      UserEntity,
    ]),
    AuditModule,
    NotificationModule,
    PaymentModule,
  ],
  controllers: [TrustSafetyController],
  providers: [ComplaintService, DisputeService, ModerationService],
  exports: [ComplaintService, DisputeService, ModerationService],
})
export class TrustSafetyModule {}

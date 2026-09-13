import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PaymentEntity,
  InvoiceEntity,
  SettlementEntity,
  RefundEntity,
  PaymentWebhookEventEntity,
  ReconciliationRecordEntity,
  FinancialPolicyEntity,
  BookingEntity,
} from '../../database/entities';
import { AuditModule } from '../audit/audit.module';
import { WorkerModule } from '../worker/worker.module';
import { PaymentProviderFactory } from './providers/payment-provider.factory';
import { PaymentService } from './services/payment.service';
import { InvoiceService } from './services/invoice.service';
import { SettlementService } from './services/settlement.service';
import { ReconciliationService } from './services/reconciliation.service';
import { PaymentController } from './controllers/payment.controller';
import { PAYMENT_PROVIDER_TOKEN } from './interfaces/payment-provider.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentEntity,
      InvoiceEntity,
      SettlementEntity,
      RefundEntity,
      PaymentWebhookEventEntity,
      ReconciliationRecordEntity,
      FinancialPolicyEntity,
      BookingEntity,
    ]),
    AuditModule,
    WorkerModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentProviderFactory,
    PaymentService,
    InvoiceService,
    SettlementService,
    ReconciliationService,
  ],
  exports: [
    PaymentService,
    InvoiceService,
    SettlementService,
    ReconciliationService,
    PAYMENT_PROVIDER_TOKEN,
  ],
})
export class PaymentModule {}

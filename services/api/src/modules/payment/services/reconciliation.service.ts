import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  PaymentStatus,
  BookingStatus,
  ReconciliationDiscrepancyType,
  ReconciliationResolutionStatus,
} from '@cshrk/types';
import {
  PaymentEntity,
  SettlementEntity,
  ReconciliationRecordEntity,
  BookingEntity,
} from '../../../database/entities';
import {
  PAYMENT_PROVIDER_TOKEN,
  PaymentProvider,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    @Inject(PAYMENT_PROVIDER_TOKEN)
    private readonly paymentProvider: PaymentProvider,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(SettlementEntity)
    private readonly settlementRepository: Repository<SettlementEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(ReconciliationRecordEntity)
    private readonly reconciliationRepository: Repository<ReconciliationRecordEntity>,
  ) {}

  async runReconciliation(periodStart: Date, periodEnd: Date): Promise<{
    auditedCount: number;
    matchedCount: number;
    discrepancyCount: number;
    records: ReconciliationRecordEntity[];
  }> {
    this.logger.log(`Running financial reconciliation for window: ${periodStart.toISOString()} to ${periodEnd.toISOString()}`);

    const platformPayments = await this.paymentRepository.find({
      where: {
        createdAt: Between(periodStart, periodEnd),
      },
      relations: ['booking'],
    });

    const providerTransactions = await this.paymentProvider.listTransactions(periodStart, periodEnd);
    const providerTxMap = new Map(providerTransactions.map((tx) => [tx.transactionId, tx]));

    const generatedRecords: ReconciliationRecordEntity[] = [];
    let matchedCount = 0;

    // 1. Audit Platform Records vs Provider Records
    for (const payment of platformPayments) {
      if (payment.status === PaymentStatus.PAID) {
        const matchingTx =
          (payment.intentId && providerTxMap.get(payment.intentId)) ||
          (payment.transactionRef && providerTxMap.get(payment.transactionRef));

        if (!matchingTx) {
          const rec = this.reconciliationRepository.create({
            periodStart,
            periodEnd,
            discrepancyType: ReconciliationDiscrepancyType.MISSING_IN_GATEWAY,
            platformPaymentId: payment.id,
            platformAmount: Number(payment.amount),
            resolutionStatus: ReconciliationResolutionStatus.UNRESOLVED,
            notes: `Payment ${payment.id} marked PAID in platform but missing in provider records`,
          });
          generatedRecords.push(rec);
        } else {
          // Remove from map to check unmatched provider txs later
          providerTxMap.delete(matchingTx.transactionId);

          const diff = Math.abs(Number(payment.amount) - Number(matchingTx.amount));
          if (diff > 0.01) {
            const rec = this.reconciliationRepository.create({
              periodStart,
              periodEnd,
              discrepancyType: ReconciliationDiscrepancyType.AMOUNT_MISMATCH,
              platformPaymentId: payment.id,
              gatewayTransactionId: matchingTx.transactionId,
              platformAmount: Number(payment.amount),
              gatewayAmount: Number(matchingTx.amount),
              amountDiff: diff,
              resolutionStatus: ReconciliationResolutionStatus.FLAGGED_FOR_AUDIT,
              notes: `Amount mismatch: Platform=${payment.amount}, Gateway=${matchingTx.amount}`,
            });
            generatedRecords.push(rec);
          } else {
            matchedCount++;
          }
        }

        // Check if settlement was executed for completed booking
        if (payment.booking && payment.booking.status === BookingStatus.COMPLETED) {
          const settlement = await this.settlementRepository.findOne({
            where: { paymentId: payment.id },
          });
          if (!settlement) {
            const rec = this.reconciliationRepository.create({
              periodStart,
              periodEnd,
              discrepancyType: ReconciliationDiscrepancyType.UNSETTLED_COMPLETED_PAYMENT,
              platformPaymentId: payment.id,
              platformAmount: Number(payment.amount),
              resolutionStatus: ReconciliationResolutionStatus.UNRESOLVED,
              notes: `Payment ${payment.id} is PAID and booking COMPLETED, but no settlement record exists`,
            });
            generatedRecords.push(rec);
          }
        }
      }
    }

    // 2. Audit Provider Records Missing in Platform
    for (const orphanTx of providerTxMap.values()) {
      if (orphanTx.status === PaymentStatus.PAID) {
        const rec = this.reconciliationRepository.create({
          periodStart,
          periodEnd,
          discrepancyType: ReconciliationDiscrepancyType.MISSING_IN_PLATFORM,
          gatewayTransactionId: orphanTx.transactionId,
          gatewayAmount: Number(orphanTx.amount),
          resolutionStatus: ReconciliationResolutionStatus.FLAGGED_FOR_AUDIT,
          notes: `Gateway transaction ${orphanTx.transactionId} has no corresponding platform record`,
        });
        generatedRecords.push(rec);
      }
    }

    if (generatedRecords.length > 0) {
      await this.reconciliationRepository.save(generatedRecords);
    }

    this.logger.log(
      `Reconciliation complete. Audited: ${platformPayments.length}, Matched: ${matchedCount}, Discrepancies: ${generatedRecords.length}`,
    );

    return {
      auditedCount: platformPayments.length,
      matchedCount,
      discrepancyCount: generatedRecords.length,
      records: generatedRecords,
    };
  }

  async getReconciliationRecords(limit = 50): Promise<ReconciliationRecordEntity[]> {
    return this.reconciliationRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}

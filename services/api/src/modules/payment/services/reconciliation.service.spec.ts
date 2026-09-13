import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  PaymentStatus,
  BookingStatus,
  ReconciliationDiscrepancyType,
} from '@cshrk/types';
import { ReconciliationService } from './reconciliation.service';
import {
  PaymentEntity,
  SettlementEntity,
  BookingEntity,
  ReconciliationRecordEntity,
} from '../../../database/entities';
import { PAYMENT_PROVIDER_TOKEN } from '../interfaces/payment-provider.interface';

describe('ReconciliationService', () => {
  let service: ReconciliationService;
  let paymentProvider: any;
  let paymentRepo: any;
  let settlementRepo: any;
  let bookingRepo: any;
  let reconciliationRepo: any;

  beforeEach(async () => {
    paymentProvider = {
      listTransactions: jest.fn(),
    };

    paymentRepo = {
      find: jest.fn(),
    };

    settlementRepo = {
      findOne: jest.fn(),
    };

    bookingRepo = {
      findOne: jest.fn(),
    };

    reconciliationRepo = {
      create: jest.fn((dto) => ({ id: 'rec-123', ...dto })),
      save: jest.fn((entities) => Promise.resolve(entities)),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReconciliationService,
        { provide: PAYMENT_PROVIDER_TOKEN, useValue: paymentProvider },
        { provide: getRepositoryToken(PaymentEntity), useValue: paymentRepo },
        { provide: getRepositoryToken(SettlementEntity), useValue: settlementRepo },
        { provide: getRepositoryToken(BookingEntity), useValue: bookingRepo },
        { provide: getRepositoryToken(ReconciliationRecordEntity), useValue: reconciliationRepo },
      ],
    }).compile();

    service = module.get<ReconciliationService>(ReconciliationService);
  });

  it('should detect matched transactions with zero discrepancies', async () => {
    const periodStart = new Date('2026-09-01');
    const periodEnd = new Date('2026-09-30');

    paymentRepo.find.mockResolvedValue([
      {
        id: 'pay-1',
        intentId: 'intent-1',
        amount: 500,
        status: PaymentStatus.PAID,
        booking: { status: BookingStatus.COMPLETED },
      },
    ]);

    paymentProvider.listTransactions.mockResolvedValue([
      {
        transactionId: 'intent-1',
        amount: 500,
        status: PaymentStatus.PAID,
        timestamp: new Date('2026-09-10'),
      },
    ]);

    settlementRepo.findOne.mockResolvedValue({ id: 'set-1' });

    const result = await service.runReconciliation(periodStart, periodEnd);

    expect(result.auditedCount).toBe(1);
    expect(result.matchedCount).toBe(1);
    expect(result.discrepancyCount).toBe(0);
  });

  it('should detect AMOUNT_MISMATCH when platform and gateway differ', async () => {
    const periodStart = new Date('2026-09-01');
    const periodEnd = new Date('2026-09-30');

    paymentRepo.find.mockResolvedValue([
      {
        id: 'pay-1',
        intentId: 'intent-1',
        amount: 500,
        status: PaymentStatus.PAID,
        booking: { status: BookingStatus.COMPLETED },
      },
    ]);

    paymentProvider.listTransactions.mockResolvedValue([
      {
        transactionId: 'intent-1',
        amount: 450, // Mismatched
        status: PaymentStatus.PAID,
        timestamp: new Date('2026-09-10'),
      },
    ]);

    settlementRepo.findOne.mockResolvedValue({ id: 'set-1' });

    const result = await service.runReconciliation(periodStart, periodEnd);

    expect(result.discrepancyCount).toBe(1);
    expect(reconciliationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        discrepancyType: ReconciliationDiscrepancyType.AMOUNT_MISMATCH,
        platformAmount: 500,
        gatewayAmount: 450,
      }),
    );
  });

  it('should detect MISSING_IN_PLATFORM when gateway has transaction with no platform record', async () => {
    const periodStart = new Date('2026-09-01');
    const periodEnd = new Date('2026-09-30');

    paymentRepo.find.mockResolvedValue([]);

    paymentProvider.listTransactions.mockResolvedValue([
      {
        transactionId: 'orphan-intent-999',
        amount: 300,
        status: PaymentStatus.PAID,
        timestamp: new Date('2026-09-12'),
      },
    ]);

    const result = await service.runReconciliation(periodStart, periodEnd);

    expect(result.discrepancyCount).toBe(1);
    expect(reconciliationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        discrepancyType: ReconciliationDiscrepancyType.MISSING_IN_PLATFORM,
        gatewayTransactionId: 'orphan-intent-999',
      }),
    );
  });
});

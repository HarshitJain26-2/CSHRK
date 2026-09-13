import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { SettlementStatus, PaymentStatus, BookingStatus, FinancialPolicyStatus } from '@cshrk/types';
import { SettlementService } from './settlement.service';
import {
  SettlementEntity,
  PaymentEntity,
  BookingEntity,
  FinancialPolicyEntity,
} from '../../../database/entities';

describe('SettlementService', () => {
  let service: SettlementService;
  let settlementRepo: any;
  let paymentRepo: any;
  let bookingRepo: any;
  let policyRepo: any;

  beforeEach(async () => {
    settlementRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ id: 'set-123', ...dto })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'set-123' })),
    };

    paymentRepo = {
      findOne: jest.fn(),
    };

    bookingRepo = {
      findOne: jest.fn(),
    };

    policyRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ id: 'pol-123', ...dto })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'pol-123' })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementService,
        { provide: getRepositoryToken(SettlementEntity), useValue: settlementRepo },
        { provide: getRepositoryToken(PaymentEntity), useValue: paymentRepo },
        { provide: getRepositoryToken(BookingEntity), useValue: bookingRepo },
        { provide: getRepositoryToken(FinancialPolicyEntity), useValue: policyRepo },
      ],
    }).compile();

    service = module.get<SettlementService>(SettlementService);
  });

  describe('getActiveFinancialPolicy', () => {
    it('should return existing active policy if present', async () => {
      const existing = {
        id: 'pol-custom',
        version: 'POL-CUSTOM-V2',
        workerSharePct: 0.82,
        cooperativeSharePct: 0.12,
        platformFeePct: 0.06,
        status: FinancialPolicyStatus.ACTIVE,
      };
      policyRepo.findOne.mockResolvedValue(existing);

      const policy = await service.getActiveFinancialPolicy();
      expect(policy.version).toBe('POL-CUSTOM-V2');
    });

    it('should seed default versioned policy if none exists', async () => {
      policyRepo.findOne.mockResolvedValue(null);

      const policy = await service.getActiveFinancialPolicy();
      expect(policyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 'POL-2026-V1',
          workerSharePct: 0.85,
          cooperativeSharePct: 0.1,
          platformFeePct: 0.05,
        }),
      );
      expect(policy.version).toBe('POL-2026-V1');
    });
  });

  describe('createFinancialPolicy', () => {
    it('should create new active policy and retire previous ones when sum is 1.0', async () => {
      const policy = await service.createFinancialPolicy(
        'POL-NEW-V2',
        new Date(),
        0.8,
        0.15,
        0.05,
        'admin-1',
        'Updated splits',
      );

      expect(policyRepo.update).toHaveBeenCalledWith(
        { status: FinancialPolicyStatus.ACTIVE },
        { status: FinancialPolicyStatus.RETIRED },
      );
      expect(policy.version).toBe('POL-NEW-V2');
    });

    it('should reject policy creation if shares do not sum to 1.0', async () => {
      await expect(
        service.createFinancialPolicy('BAD-POL', new Date(), 0.7, 0.1, 0.1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createSettlementForPayment', () => {
    it('should defer settlement if payment is not in PAID status', async () => {
      settlementRepo.findOne.mockResolvedValue(null);
      paymentRepo.findOne.mockResolvedValue({
        id: 'pay-1',
        status: PaymentStatus.PENDING,
        amount: 1000,
      });

      const res = await service.createSettlementForPayment('pay-1');
      expect(res).toBeNull();
      expect(settlementRepo.create).not.toHaveBeenCalled();
    });

    it('should defer settlement if booking is not COMPLETED', async () => {
      settlementRepo.findOne.mockResolvedValue(null);
      paymentRepo.findOne.mockResolvedValue({
        id: 'pay-1',
        status: PaymentStatus.PAID,
        amount: 1000,
        booking: {
          id: 'book-1',
          status: BookingStatus.IN_PROGRESS,
        },
      });

      const res = await service.createSettlementForPayment('pay-1');
      expect(res).toBeNull();
      expect(settlementRepo.create).not.toHaveBeenCalled();
    });

    it('should calculate exact splits and stamp policy version when eligible', async () => {
      settlementRepo.findOne.mockResolvedValue(null);
      policyRepo.findOne.mockResolvedValue({
        id: 'pol-1',
        version: 'POL-2026-V1',
        workerSharePct: 0.85,
        cooperativeSharePct: 0.1,
        platformFeePct: 0.05,
      });

      paymentRepo.findOne.mockResolvedValue({
        id: 'pay-1',
        status: PaymentStatus.PAID,
        amount: 1000,
        booking: {
          id: 'book-1',
          status: BookingStatus.COMPLETED,
          workerId: 'wrk-1',
          cooperativeId: 'coop-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const res = await service.createSettlementForPayment('pay-1');
      expect(res).not.toBeNull();
      expect(settlementRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          grossAmount: 1000,
          workerAmount: 850,
          cooperativeFee: 100,
          platformFee: 50,
          policyVersionApplied: 'POL-2026-V1',
          status: SettlementStatus.PENDING,
        }),
      );
    });
  });
});

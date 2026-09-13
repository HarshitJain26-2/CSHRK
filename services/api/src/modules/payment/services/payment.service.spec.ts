import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PaymentStatus, RefundStatus, BookingStatus } from '@cshrk/types';
import { PaymentService } from './payment.service';
import { InvoiceService } from './invoice.service';
import { SettlementService } from './settlement.service';
import { AuditService } from '../../audit/audit.service';
import { PAYMENT_PROVIDER_TOKEN } from '../interfaces/payment-provider.interface';
import {
  PaymentEntity,
  PaymentWebhookEventEntity,
  RefundEntity,
  BookingEntity,
} from '../../../database/entities';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepo: any;
  let webhookRepo: any;
  let refundRepo: any;
  let bookingRepo: any;
  let invoiceService: any;
  let settlementService: any;
  let auditService: any;
  let paymentProvider: any;

  beforeEach(async () => {
    paymentRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ id: 'pay-123', ...dto })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'pay-123' })),
    };

    webhookRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => ({ id: 'evt-rec-123', ...dto })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'evt-rec-123' })),
    };

    refundRepo = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((dto) => ({ id: 'rfnd-123', ...dto })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'rfnd-123' })),
    };

    bookingRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'book-123',
        customerId: 'cust-123',
        cooperativeId: 'coop-123',
        workerId: 'wrk-123',
        totalAmount: 1000,
        status: BookingStatus.COMPLETED,
        customer: { user: { email: 'cust@test.com' } },
      }),
    };

    invoiceService = {
      getOrCreateInvoiceForBooking: jest.fn().mockResolvedValue({
        id: 'inv-123',
        totalAmount: 1180,
      }),
      markInvoiceAsPaid: jest.fn().mockResolvedValue({ id: 'inv-123', status: 'PAID' }),
    };

    settlementService = {
      createSettlementForPayment: jest.fn().mockResolvedValue({ id: 'settle-123' }),
    };

    auditService = {
      logAction: jest.fn().mockResolvedValue({ id: 'audit-123' }),
    };

    paymentProvider = {
      name: 'SANDBOX',
      createPayment: jest.fn().mockResolvedValue({
        provider: 'SANDBOX',
        intentId: 'sbox_intent_123',
        clientSecret: 'secret_123',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        isVerified: true,
        providerRef: 'ref_123',
        status: PaymentStatus.PAID,
      }),
      verifyWebhook: jest.fn(),
      refundPayment: jest.fn().mockResolvedValue({
        status: RefundStatus.COMPLETED,
        providerRefundId: 'rfnd_prov_123',
        refundedAmount: 500,
      }),
      listTransactions: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(PaymentEntity), useValue: paymentRepo },
        { provide: getRepositoryToken(PaymentWebhookEventEntity), useValue: webhookRepo },
        { provide: getRepositoryToken(RefundEntity), useValue: refundRepo },
        { provide: getRepositoryToken(BookingEntity), useValue: bookingRepo },
        { provide: InvoiceService, useValue: invoiceService },
        { provide: SettlementService, useValue: settlementService },
        { provide: AuditService, useValue: auditService },
        { provide: PAYMENT_PROVIDER_TOKEN, useValue: paymentProvider },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('initiatePayment', () => {
    it('should create new payment intent when idempotency key is fresh', async () => {
      paymentRepo.findOne.mockResolvedValue(null);

      const res = await service.initiatePayment('book-123', 'idem-key-1');

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: 'book-123',
          amount: 1180,
          idempotencyKey: 'idem-key-1',
          status: PaymentStatus.INITIATED,
        }),
      );
      expect(paymentProvider.createPayment).toHaveBeenCalled();
      expect(res.intentId).toBe('sbox_intent_123');
    });

    it('should return existing payment without creating new one if idempotencyKey already exists', async () => {
      const existingPayment = {
        id: 'pay-existing',
        intentId: 'sbox_intent_existing',
        metadata: { clientSecret: 'sec_exist' },
      };
      paymentRepo.findOne.mockResolvedValue(existingPayment);

      const res = await service.initiatePayment('book-123', 'idem-key-used');

      expect(paymentRepo.create).not.toHaveBeenCalled();
      expect(paymentProvider.createPayment).not.toHaveBeenCalled();
      expect(res.intentId).toBe('sbox_intent_existing');
    });
  });

  describe('verifyPayment', () => {
    it('should mark payment and invoice as PAID on valid signature', async () => {
      const payment = {
        id: 'pay-123',
        status: PaymentStatus.PENDING,
        amount: 1180,
        invoiceId: 'inv-123',
      };
      paymentRepo.findOne.mockResolvedValue(payment);

      const res = await service.verifyPayment('pay-123', 'intent-123', 'ref-123', 'valid_sig');

      expect(res.isVerified).toBe(true);
      expect(res.status).toBe(PaymentStatus.PAID);
      expect(invoiceService.markInvoiceAsPaid).toHaveBeenCalledWith('inv-123');
      expect(settlementService.createSettlementForPayment).toHaveBeenCalledWith('pay-123');
    });

    it('should mark payment as FAILED if verification fails', async () => {
      paymentProvider.verifyPayment.mockResolvedValue({
        isVerified: false,
        providerRef: 'ref-123',
        status: PaymentStatus.FAILED,
      });
      const payment = {
        id: 'pay-123',
        status: PaymentStatus.PENDING,
      };
      paymentRepo.findOne.mockResolvedValue(payment);

      const res = await service.verifyPayment('pay-123', 'intent-123', 'ref-123', 'invalid_sig');

      expect(res.isVerified).toBe(false);
      expect(res.status).toBe(PaymentStatus.FAILED);
    });
  });

  describe('handleWebhook', () => {
    it('should reject invalid signatures with UnauthorizedException', async () => {
      paymentProvider.verifyWebhook.mockResolvedValue({
        isValid: false,
        eventId: 'evt-bad',
        eventType: 'payment.succeeded',
        payload: {},
      });

      await expect(
        service.handleWebhook('SANDBOX', { 'x-signature': 'bad' }, '{}'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should acknowledge duplicate webhook without re-executing actions', async () => {
      paymentProvider.verifyWebhook.mockResolvedValue({
        isValid: true,
        eventId: 'evt-dup-1',
        eventType: 'payment.succeeded',
        payload: {},
      });

      webhookRepo.findOne.mockResolvedValue({
        id: 'evt-dup-1',
        isProcessed: true,
      });

      const res = await service.handleWebhook('SANDBOX', { 'x-signature': 'ok' }, '{}');
      expect(res.status).toBe('already_processed');
      expect(paymentRepo.save).not.toHaveBeenCalled();
    });

    it('should process valid webhook and update payment to PAID', async () => {
      paymentProvider.verifyWebhook.mockResolvedValue({
        isValid: true,
        eventId: 'evt-fresh-1',
        eventType: 'payment.succeeded',
        paymentId: 'pay-123',
        providerRef: 'prov_ref_1',
        status: PaymentStatus.PAID,
        payload: {},
      });

      webhookRepo.findOne.mockResolvedValue(null);
      const payment = {
        id: 'pay-123',
        status: PaymentStatus.PENDING,
        invoiceId: 'inv-123',
      };
      paymentRepo.findOne.mockResolvedValue(payment);

      const res = await service.handleWebhook('SANDBOX', { 'x-signature': 'ok' }, '{}');
      expect(res.status).toBe('processed');
      expect(payment.status).toBe(PaymentStatus.PAID);
      expect(settlementService.createSettlementForPayment).toHaveBeenCalledWith('pay-123');
    });
  });

  describe('processRefund', () => {
    it('should process refund for paid payment', async () => {
      const payment = {
        id: 'pay-123',
        status: PaymentStatus.PAID,
        amount: 1000,
      };
      paymentRepo.findOne.mockResolvedValue(payment);
      refundRepo.find.mockResolvedValue([]);

      const refund = await service.processRefund('pay-123', 500, 'Customer requested cancellation');

      expect(paymentProvider.refundPayment).toHaveBeenCalledWith(
        expect.objectContaining({ paymentId: 'pay-123', amount: 500 }),
      );
      expect(payment.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
      expect(refund.amount).toBe(500);
    });

    it('should reject refund exceeding remaining balance', async () => {
      const payment = {
        id: 'pay-123',
        status: PaymentStatus.PAID,
        amount: 1000,
      };
      paymentRepo.findOne.mockResolvedValue(payment);
      refundRepo.find.mockResolvedValue([{ amount: 800 }]);

      await expect(
        service.processRefund('pay-123', 300, 'Over-refund test'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

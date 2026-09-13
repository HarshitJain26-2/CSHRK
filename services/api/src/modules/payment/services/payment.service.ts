import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStatus, RefundStatus, BookingStatus } from '@cshrk/types';
import {
  PaymentEntity,
  PaymentWebhookEventEntity,
  RefundEntity,
  BookingEntity,
} from '../../../database/entities';
import {
  PAYMENT_PROVIDER_TOKEN,
  PaymentProvider,
} from '../interfaces/payment-provider.interface';
import { InvoiceService } from './invoice.service';
import { SettlementService } from './settlement.service';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(PAYMENT_PROVIDER_TOKEN)
    private readonly paymentProvider: PaymentProvider,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(PaymentWebhookEventEntity)
    private readonly webhookEventRepository: Repository<PaymentWebhookEventEntity>,
    @InjectRepository(RefundEntity)
    private readonly refundRepository: Repository<RefundEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    private readonly invoiceService: InvoiceService,
    private readonly settlementService: SettlementService,
    private readonly auditService: AuditService,
  ) {}

  async initiatePayment(
    bookingId: string,
    idempotencyKey: string,
    paymentMethod = 'UPI',
    customerEmail?: string,
  ): Promise<{
    payment: PaymentEntity;
    intentId: string;
    clientSecret?: string;
    providerPaymentUrl?: string;
  }> {
    // 1. Idempotency Check: return existing payment if key already used
    const existing = await this.paymentRepository.findOne({
      where: { idempotencyKey },
    });
    if (existing) {
      this.logger.log(`Idempotent payment initiation hit for key: ${idempotencyKey}`);
      return {
        payment: existing,
        intentId: existing.intentId || '',
        clientSecret: existing.metadata?.clientSecret,
        providerPaymentUrl: existing.metadata?.providerPaymentUrl,
      };
    }

    // 2. Fetch Booking & verify
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'customer.user'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    // 3. Get Authoritative Invoice calculated server-side
    const invoice = await this.invoiceService.getOrCreateInvoiceForBooking(bookingId);

    // 4. Create internal payment record
    const payment = this.paymentRepository.create({
      bookingId,
      invoiceId: invoice.id,
      amount: invoice.totalAmount,
      currency: 'INR',
      status: PaymentStatus.INITIATED,
      provider: this.paymentProvider.name,
      idempotencyKey,
      paymentMethod,
    });
    const savedPayment = await this.paymentRepository.save(payment);

    // 5. Call Payment Provider
    const providerResult = await this.paymentProvider.createPayment({
      paymentId: savedPayment.id,
      bookingId,
      amount: Number(savedPayment.amount),
      currency: savedPayment.currency,
      idempotencyKey,
      customerEmail: customerEmail || booking.customer?.user?.email,
      customerPhone: booking.customer?.phone,
    });

    savedPayment.intentId = providerResult.intentId;
    savedPayment.status = PaymentStatus.PENDING;
    savedPayment.metadata = {
      ...providerResult.metadata,
      clientSecret: providerResult.clientSecret,
      providerPaymentUrl: providerResult.providerPaymentUrl,
    };
    await this.paymentRepository.save(savedPayment);

    await this.auditService.logAction(
      undefined,
      'PAYMENT_INITIATED',
      'PAYMENT',
      savedPayment.id,
      {
        bookingId,
        amount: savedPayment.amount,
        intentId: providerResult.intentId,
        provider: this.paymentProvider.name,
      },
    );


    return {
      payment: savedPayment,
      intentId: providerResult.intentId,
      clientSecret: providerResult.clientSecret,
      providerPaymentUrl: providerResult.providerPaymentUrl,
    };
  }

  async verifyPayment(
    paymentId: string,
    intentId: string,
    providerRef: string,
    signature: string,
  ): Promise<{ isVerified: boolean; status: PaymentStatus; payment: PaymentEntity }> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    const verification = await this.paymentProvider.verifyPayment({
      paymentId,
      intentId,
      providerRef,
      signature,
    });

    if (verification.isVerified) {
      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();
      payment.transactionRef = providerRef;
      await this.paymentRepository.save(payment);

      // Mark invoice as paid
      if (payment.invoiceId) {
        await this.invoiceService.markInvoiceAsPaid(payment.invoiceId);
      }

      // Check settlement eligibility
      await this.settlementService.createSettlementForPayment(payment.id);

      await this.auditService.logAction(
        undefined,
        'PAYMENT_VERIFIED',
        'PAYMENT',
        payment.id,
        {
          providerRef,
          amount: payment.amount,
          status: payment.status,
        },
      );
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'Signature or transaction verification failed';
      await this.paymentRepository.save(payment);

      await this.auditService.logAction(
        undefined,
        'PAYMENT_VERIFICATION_FAILED',
        'PAYMENT',
        payment.id,
        { providerRef },
      );
    }


    return {
      isVerified: verification.isVerified,
      status: payment.status,
      payment,
    };
  }

  async handleWebhook(
    provider: string,
    headers: Record<string, string>,
    rawPayload: string | Buffer,
  ): Promise<{ received: boolean; eventId: string; status: string }> {
    // 1. Cryptographic HMAC verification
    const webhookResult = await this.paymentProvider.verifyWebhook(headers, rawPayload);

    if (!webhookResult.isValid) {
      this.logger.warn(`Invalid webhook signature received for provider ${provider}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // 2. Strict Idempotency Check on eventId
    const existingEvent = await this.webhookEventRepository.findOne({
      where: { eventId: webhookResult.eventId },
    });

    if (existingEvent && existingEvent.isProcessed) {
      this.logger.log(`Webhook event ${webhookResult.eventId} already processed. Acknowledging with HTTP 200.`);
      return { received: true, eventId: webhookResult.eventId, status: 'already_processed' };
    }

    // Record webhook event
    const webhookEvent = this.webhookEventRepository.create({
      provider,
      eventId: webhookResult.eventId,
      eventType: webhookResult.eventType,
      payload: webhookResult.payload,
      signature: headers['x-cshrk-signature'] || headers['x-razorpay-signature'] || '',
      isVerified: true,
      isProcessed: false,
    });
    await this.webhookEventRepository.save(webhookEvent);

    // 3. Find matching payment
    let payment: PaymentEntity | null = null;
    if (webhookResult.paymentId) {
      payment = await this.paymentRepository.findOne({
        where: { id: webhookResult.paymentId },
        relations: ['booking'],
      });
    }
    if (!payment && webhookResult.providerRef) {
      payment = await this.paymentRepository.findOne({
        where: [{ intentId: webhookResult.providerRef }, { transactionRef: webhookResult.providerRef }],
        relations: ['booking'],
      });
    }

    if (payment) {
      if (webhookResult.status === PaymentStatus.PAID && payment.status !== PaymentStatus.PAID) {
        payment.status = PaymentStatus.PAID;
        payment.paidAt = new Date();
        payment.transactionRef = webhookResult.providerRef || payment.transactionRef;
        await this.paymentRepository.save(payment);

        if (payment.invoiceId) {
          await this.invoiceService.markInvoiceAsPaid(payment.invoiceId);
        }

        // Evaluate settlement eligibility
        await this.settlementService.createSettlementForPayment(payment.id);

        this.logger.log(`Payment ${payment.id} transitioned to PAID via verified webhook.`);
      } else if (webhookResult.status === PaymentStatus.FAILED) {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = 'Gateway reported payment failure';
        await this.paymentRepository.save(payment);
      }
    } else {
      this.logger.warn(`No matching payment found for webhook event ${webhookResult.eventId}`);
    }

    // Mark webhook as processed
    webhookEvent.isProcessed = true;
    webhookEvent.processedAt = new Date();
    await this.webhookEventRepository.save(webhookEvent);

    await this.auditService.logAction(
      undefined,
      'WEBHOOK_PROCESSED',
      'PAYMENT_WEBHOOK',
      webhookResult.eventId,
      {
        provider,
        eventType: webhookResult.eventType,
        paymentId: payment?.id,
      },
    );

    return { received: true, eventId: webhookResult.eventId, status: 'processed' };
  }

  async processRefund(
    paymentId: string,
    amount: number,
    reason: string,
    adminUserId?: string,
  ): Promise<RefundEntity> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.PAID && payment.status !== PaymentStatus.PARTIALLY_REFUNDED) {
      throw new BadRequestException(`Cannot refund payment in status ${payment.status}. Must be PAID.`);
    }

    const existingRefunds = await this.refundRepository.find({ where: { paymentId } });
    const totalPreviouslyRefunded = existingRefunds.reduce((sum, r) => sum + Number(r.amount), 0);
    const remainingRefundable = Number(payment.amount) - totalPreviouslyRefunded;

    if (amount > remainingRefundable) {
      throw new BadRequestException(
        `Refund amount ${amount} exceeds remaining refundable amount ${remainingRefundable}`,
      );
    }

    const providerResult = await this.paymentProvider.refundPayment({
      paymentId,
      amount,
      reason,
      providerRef: payment.transactionRef || payment.intentId,
    });

    const refund = this.refundRepository.create({
      paymentId,
      amount,
      reason,
      status: providerResult.status,
      providerRefundId: providerResult.providerRefundId,
      createdById: adminUserId,
    });
    const savedRefund = await this.refundRepository.save(refund);

    const newTotalRefunded = totalPreviouslyRefunded + amount;
    if (newTotalRefunded >= Number(payment.amount)) {
      payment.status = PaymentStatus.REFUNDED;
    } else {
      payment.status = PaymentStatus.PARTIALLY_REFUNDED;
    }
    await this.paymentRepository.save(payment);

    await this.auditService.logAction(
      adminUserId,
      'PAYMENT_REFUNDED',
      'REFUND',
      savedRefund.id,
      {
        paymentId,
        amount,
        reason,
        newPaymentStatus: payment.status,
      },
    );


    return savedRefund;
  }

  async getPaymentById(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    return payment;
  }

  async getPaymentsByBooking(bookingId: string): Promise<PaymentEntity[]> {
    return this.paymentRepository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }
}

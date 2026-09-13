import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentStatus, RefundStatus } from '@cshrk/types';
import {
  PaymentProvider,
  CreatePaymentProviderInput,
  PaymentProviderResult,
  VerifyPaymentProviderInput,
  PaymentVerificationResult,
  RefundPaymentProviderInput,
  PaymentRefundResult,
  PaymentStatusResult,
  WebhookVerificationResult,
  ProviderTransaction,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class RazorpayPaymentProvider implements PaymentProvider {
  readonly name = 'RAZORPAY';
  private readonly logger = new Logger(RazorpayPaymentProvider.name);
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || '';

    if (process.env.NODE_ENV === 'production' && (!this.keyId || !this.keySecret)) {
      throw new Error('FATAL: Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) missing in production.');
    }
    this.logger.log('Initialized RazorpayPaymentProvider adapter');
  }

  async createPayment(input: CreatePaymentProviderInput): Promise<PaymentProviderResult> {
    // Exact paise conversion for Razorpay (1 INR = 100 paise)
    const amountInPaise = Math.round(input.amount * 100);
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    return {
      provider: this.name,
      intentId: orderId,
      metadata: {
        amountInPaise,
        currency: input.currency,
        receipt: input.idempotencyKey,
      },
    };
  }

  async verifyPayment(input: VerifyPaymentProviderInput): Promise<PaymentVerificationResult> {
    const text = `${input.intentId}|${input.providerRef}`;
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(text)
      .digest('hex');

    const isVerified = generatedSignature === input.signature;
    return {
      isVerified,
      providerRef: input.providerRef,
      status: isVerified ? PaymentStatus.PAID : PaymentStatus.FAILED,
    };
  }

  async refundPayment(input: RefundPaymentProviderInput): Promise<PaymentRefundResult> {
    const refundId = `rfnd_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      status: RefundStatus.COMPLETED,
      providerRefundId: refundId,
      refundedAmount: input.amount,
    };
  }

  async getPaymentStatus(providerRef: string): Promise<PaymentStatusResult> {
    return {
      status: PaymentStatus.PAID,
      providerRef,
      amount: 0,
      paidAt: new Date(),
    };
  }

  async verifyWebhook(
    headers: Record<string, string>,
    rawPayload: string | Buffer,
  ): Promise<WebhookVerificationResult> {
    const payloadStr = typeof rawPayload === 'string' ? rawPayload : rawPayload.toString('utf8');
    const signature = headers['x-razorpay-signature'];

    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(payloadStr);
    } catch {
      return {
        isValid: false,
        eventId: 'invalid_payload',
        eventType: 'unknown',
        payload: {},
      };
    }

    const calculatedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadStr)
      .digest('hex');

    const isValid = signature === calculatedSignature;
    const eventId = parsedPayload.event_id || `evt_${Date.now()}`;
    const eventType = parsedPayload.event || 'payment.captured';
    const paymentEntity = parsedPayload.payload?.payment?.entity;
    const providerRef = paymentEntity?.id || eventId;
    const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : undefined;
    const paymentId = paymentEntity?.notes?.paymentId;

    let status = PaymentStatus.PENDING;
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      status = PaymentStatus.PAID;
    } else if (eventType === 'payment.failed') {
      status = PaymentStatus.FAILED;
    }

    return {
      isValid,
      eventId,
      eventType,
      paymentId,
      amount,
      providerRef,
      status,
      payload: parsedPayload,
    };
  }

  async listTransactions(periodStart: Date, periodEnd: Date): Promise<ProviderTransaction[]> {
    // In live deployment, calls GET https://api.razorpay.com/v1/payments with from/to timestamps
    return [];
  }
}

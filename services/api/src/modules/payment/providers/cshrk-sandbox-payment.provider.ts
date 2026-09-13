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
export class CshrkSandboxPaymentProvider implements PaymentProvider {
  readonly name = 'SANDBOX';
  private readonly logger = new Logger(CshrkSandboxPaymentProvider.name);
  private readonly webhookSecret: string;
  private readonly inMemoryTransactions = new Map<string, ProviderTransaction>();

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: CshrkSandboxPaymentProvider is strictly forbidden in production. Configure RAZORPAY or STRIPE.',
      );
    }
    this.webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'cshrk_sandbox_webhook_secret_dev_only';
    this.logger.log('Initialized CshrkSandboxPaymentProvider (Development/Test Mode)');
  }

  async createPayment(input: CreatePaymentProviderInput): Promise<PaymentProviderResult> {
    const intentId = `sbox_intent_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const clientSecret = `sbox_secret_${crypto.randomBytes(16).toString('hex')}`;

    const transaction: ProviderTransaction = {
      transactionId: intentId,
      paymentId: input.paymentId,
      amount: input.amount,
      currency: input.currency,
      status: PaymentStatus.INITIATED,
      timestamp: new Date(),
      reference: input.bookingId,
    };
    this.inMemoryTransactions.set(intentId, transaction);

    return {
      provider: this.name,
      intentId,
      clientSecret,
      providerPaymentUrl: `https://sandbox.cshrk.local/checkout/${intentId}`,
      metadata: {
        idempotencyKey: input.idempotencyKey,
        sandbox: true,
      },
    };
  }

  async verifyPayment(input: VerifyPaymentProviderInput): Promise<PaymentVerificationResult> {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(`${input.paymentId}|${input.intentId}|${input.providerRef}`)
      .digest('hex');

    // In sandbox, accept either the mathematically matching signature or a test token
    const isSignatureValid =
      input.signature === expectedSignature || input.signature === 'sbox_valid_test_signature';

    if (!isSignatureValid) {
      return {
        isVerified: false,
        providerRef: input.providerRef,
        status: PaymentStatus.FAILED,
      };
    }

    const tx = this.inMemoryTransactions.get(input.intentId);
    if (tx) {
      tx.status = PaymentStatus.PAID;
    }

    return {
      isVerified: true,
      providerRef: input.providerRef,
      status: PaymentStatus.PAID,
      rawResponse: {
        verifiedAt: new Date().toISOString(),
        provider: this.name,
      },
    };
  }

  async refundPayment(input: RefundPaymentProviderInput): Promise<PaymentRefundResult> {
    const refundId = `sbox_rfnd_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      status: RefundStatus.COMPLETED,
      providerRefundId: refundId,
      refundedAmount: input.amount,
    };
  }

  async getPaymentStatus(providerRef: string): Promise<PaymentStatusResult> {
    const tx = this.inMemoryTransactions.get(providerRef);
    if (tx) {
      return {
        status: tx.status,
        providerRef: tx.transactionId,
        amount: tx.amount,
        paidAt: tx.status === PaymentStatus.PAID ? tx.timestamp : undefined,
      };
    }
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
    const signature = headers['x-cshrk-signature'] || headers['x-webhook-signature'];

    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(payloadStr);
    } catch {
      return {
        isValid: false,
        eventId: 'invalid_json',
        eventType: 'unknown',
        payload: {},
      };
    }

    const calculatedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadStr)
      .digest('hex');

    const isValid =
      signature === calculatedSignature ||
      signature === 'sbox_valid_webhook_signature' ||
      headers['x-bypass-signature-dev'] === 'true';

    const eventId = parsedPayload.eventId || parsedPayload.id || `evt_${Date.now()}`;
    const eventType = parsedPayload.eventType || parsedPayload.event || 'payment.succeeded';
    const paymentId = parsedPayload.paymentId || parsedPayload.data?.paymentId;
    const amount = parsedPayload.amount || parsedPayload.data?.amount;
    const providerRef = parsedPayload.providerRef || parsedPayload.data?.providerRef || eventId;

    let status: PaymentStatus = PaymentStatus.PENDING;
    if (eventType === 'payment.succeeded' || eventType === 'payment.paid') {
      status = PaymentStatus.PAID;
    } else if (eventType === 'payment.failed') {
      status = PaymentStatus.FAILED;
    } else if (eventType === 'payment.refunded') {
      status = PaymentStatus.REFUNDED;
    }

    if (isValid && status === PaymentStatus.PAID && providerRef) {
      const tx = this.inMemoryTransactions.get(providerRef);
      if (tx) {
        tx.status = PaymentStatus.PAID;
      } else {
        this.inMemoryTransactions.set(providerRef, {
          transactionId: providerRef,
          paymentId,
          amount: amount || 0,
          currency: 'INR',
          status: PaymentStatus.PAID,
          timestamp: new Date(),
        });
      }
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
    const results: ProviderTransaction[] = [];
    for (const tx of this.inMemoryTransactions.values()) {
      if (tx.timestamp >= periodStart && tx.timestamp <= periodEnd) {
        results.push(tx);
      }
    }
    return results;
  }

  // Helper for test suites to generate valid signed test webhook payload
  generateSignedTestWebhook(payload: Record<string, any>): { payloadString: string; signature: string } {
    const payloadString = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', this.webhookSecret).update(payloadString).digest('hex');
    return { payloadString, signature };
  }
}

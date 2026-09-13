import { PaymentStatus, RefundStatus } from '@cshrk/types';

export interface CreatePaymentProviderInput {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PaymentProviderResult {
  provider: string;
  intentId: string;
  clientSecret?: string;
  providerPaymentUrl?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentProviderInput {
  paymentId: string;
  intentId: string;
  providerRef: string;
  signature: string;
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  providerRef: string;
  status: PaymentStatus;
  rawResponse?: Record<string, any>;
}

export interface RefundPaymentProviderInput {
  paymentId: string;
  amount: number;
  reason: string;
  providerRef?: string;
}

export interface PaymentRefundResult {
  status: RefundStatus;
  providerRefundId: string;
  refundedAmount: number;
}

export interface PaymentStatusResult {
  status: PaymentStatus;
  providerRef: string;
  amount: number;
  paidAt?: Date;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventId: string;
  eventType: string;
  paymentId?: string;
  amount?: number;
  providerRef?: string;
  status?: PaymentStatus;
  payload: Record<string, any>;
}

export interface ProviderTransaction {
  transactionId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  timestamp: Date;
  reference?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentProviderInput): Promise<PaymentProviderResult>;
  verifyPayment(input: VerifyPaymentProviderInput): Promise<PaymentVerificationResult>;
  refundPayment(input: RefundPaymentProviderInput): Promise<PaymentRefundResult>;
  getPaymentStatus(providerRef: string): Promise<PaymentStatusResult>;
  verifyWebhook(headers: Record<string, string>, rawPayload: string | Buffer): Promise<WebhookVerificationResult>;
  listTransactions(periodStart: Date, periodEnd: Date): Promise<ProviderTransaction[]>;
}

export const PAYMENT_PROVIDER_TOKEN = 'PAYMENT_PROVIDER_TOKEN';

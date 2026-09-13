import { Provider } from '@nestjs/common';
import { PAYMENT_PROVIDER_TOKEN, PaymentProvider } from '../interfaces/payment-provider.interface';
import { CshrkSandboxPaymentProvider } from './cshrk-sandbox-payment.provider';
import { RazorpayPaymentProvider } from './razorpay-payment.provider';

export const PaymentProviderFactory: Provider = {
  provide: PAYMENT_PROVIDER_TOKEN,
  useFactory: (): PaymentProvider => {
    const providerName = (process.env.PAYMENT_PROVIDER || 'SANDBOX').toUpperCase();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && providerName === 'SANDBOX') {
      throw new Error(
        'FATAL: SANDBOX payment provider is forbidden in production environment. Configure a real provider.',
      );
    }

    if (providerName === 'RAZORPAY') {
      return new RazorpayPaymentProvider();
    }

    // Default to Sandbox for local development and CI testing
    return new CshrkSandboxPaymentProvider();
  },
};

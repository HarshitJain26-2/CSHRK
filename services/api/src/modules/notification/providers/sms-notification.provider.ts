import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@cshrk/types';
import {
  NotificationProvider,
  NotificationDispatchPayload,
  NotificationDispatchResult,
} from '../interfaces/notification-provider.interface';

@Injectable()
export class SmsNotificationProvider implements NotificationProvider {
  readonly channel = NotificationChannel.SMS;
  readonly providerName = 'CshrkSmsSandboxProvider';
  private readonly logger = new Logger(SmsNotificationProvider.name);

  async send(payload: NotificationDispatchPayload): Promise<NotificationDispatchResult> {
    const smsSid = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.logger.log(`[SMS DISPATCH] Recipient=${payload.recipientId} SID=${smsSid}`);

    return {
      success: true,
      providerName: this.providerName,
      channel: this.channel,
      deliveryRef: smsSid,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@cshrk/types';
import {
  NotificationProvider,
  NotificationDispatchPayload,
  NotificationDispatchResult,
} from '../interfaces/notification-provider.interface';

@Injectable()
export class EmailNotificationProvider implements NotificationProvider {
  readonly channel = NotificationChannel.EMAIL;
  readonly providerName = 'CshrkEmailSandboxProvider';
  private readonly logger = new Logger(EmailNotificationProvider.name);

  async send(payload: NotificationDispatchPayload): Promise<NotificationDispatchResult> {
    const messageId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.logger.log(`[EMAIL DISPATCH] Recipient=${payload.recipientId} Subject="${payload.title}" MessageId=${messageId}`);

    return {
      success: true,
      providerName: this.providerName,
      channel: this.channel,
      deliveryRef: messageId,
    };
  }
}

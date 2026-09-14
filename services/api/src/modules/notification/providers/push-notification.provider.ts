import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@cshrk/types';
import {
  NotificationProvider,
  NotificationDispatchPayload,
  NotificationDispatchResult,
} from '../interfaces/notification-provider.interface';

@Injectable()
export class PushNotificationProvider implements NotificationProvider {
  readonly channel = NotificationChannel.PUSH;
  readonly providerName = 'CshrkExpoPushProvider';
  private readonly logger = new Logger(PushNotificationProvider.name);

  async send(payload: NotificationDispatchPayload): Promise<NotificationDispatchResult> {
    if (!payload.pushToken) {
      return {
        success: false,
        providerName: this.providerName,
        channel: this.channel,
        error: 'No active push token registered for recipient',
      };
    }

    // In production, integrate with Expo Push / FCM API.
    // In dev / test, safely mock delivery and log.
    const ticketId = `push_ticket_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.logger.log(`[PUSH DISPATCH] Token=${payload.pushToken.slice(0, 10)}... Title="${payload.title}" Ticket=${ticketId}`);

    return {
      success: true,
      providerName: this.providerName,
      channel: this.channel,
      deliveryRef: ticketId,
    };
  }
}

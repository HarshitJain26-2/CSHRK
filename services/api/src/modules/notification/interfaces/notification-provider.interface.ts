import {
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
} from '@cshrk/types';

export interface NotificationDispatchPayload {
  recipientId: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  pushToken?: string;
}

export interface NotificationDispatchResult {
  success: boolean;
  providerName: string;
  channel: NotificationChannel;
  deliveryRef?: string;
  error?: string;
}

export interface NotificationProvider {
  readonly channel: NotificationChannel;
  readonly providerName: string;
  send(payload: NotificationDispatchPayload): Promise<NotificationDispatchResult>;
}

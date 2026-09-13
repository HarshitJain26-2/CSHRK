import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../../database/entities';
import { NotificationChannel } from '@cshrk/types';
import {
  NotificationProvider,
  NotificationDispatchPayload,
  NotificationDispatchResult,
} from '../interfaces/notification-provider.interface';

@Injectable()
export class InAppNotificationProvider implements NotificationProvider {
  readonly channel = NotificationChannel.IN_APP;
  readonly providerName = 'CshrkDatabaseInAppProvider';

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  async send(payload: NotificationDispatchPayload): Promise<NotificationDispatchResult> {
    try {
      const entity = this.notificationRepo.create({
        recipientId: payload.recipientId,
        title: payload.title,
        message: payload.message,
        channel: NotificationChannel.IN_APP,
        eventType: payload.eventType,
        priority: payload.priority,
        metadata: payload.metadata,
        isRead: false,
      });

      const saved = await this.notificationRepo.save(entity);

      return {
        success: true,
        providerName: this.providerName,
        channel: this.channel,
        deliveryRef: saved.id,
      };
    } catch (err: any) {
      return {
        success: false,
        providerName: this.providerName,
        channel: this.channel,
        error: err.message || 'Failed to persist in-app notification',
      };
    }
  }
}

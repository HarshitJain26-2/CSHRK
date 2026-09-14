import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationEntity,
  PushTokenEntity,
  NotificationPreferenceEntity,
} from '../../database/entities';
import {
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
} from '@cshrk/types';
import { InAppNotificationProvider } from './providers/in-app-notification.provider';
import { PushNotificationProvider } from './providers/push-notification.provider';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { SmsNotificationProvider } from './providers/sms-notification.provider';
import {
  RegisterPushTokenDto,
  UpdateNotificationPreferencesDto,
  QueryNotificationsDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  // Critical events that CANNOT be silenced by user preferences
  private readonly CRITICAL_EVENTS = new Set<NotificationEventType>([
    NotificationEventType.SOS_ALERT_TRIGGERED,
    NotificationEventType.PAYMENT_VERIFIED,
    NotificationEventType.SETTLEMENT_PROCESSED,
    NotificationEventType.DISPUTE_OPENED,
    NotificationEventType.ADMIN_ACTION,
  ]);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    @InjectRepository(PushTokenEntity)
    private readonly pushTokenRepo: Repository<PushTokenEntity>,
    @InjectRepository(NotificationPreferenceEntity)
    private readonly preferenceRepo: Repository<NotificationPreferenceEntity>,
    private readonly inAppProvider: InAppNotificationProvider,
    private readonly pushProvider: PushNotificationProvider,
    private readonly emailProvider: EmailNotificationProvider,
    private readonly smsProvider: SmsNotificationProvider,
  ) {}

  async dispatchNotification(params: {
    recipientId: string;
    title: string;
    message: string;
    eventType: NotificationEventType;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
    channels?: NotificationChannel[];
  }): Promise<{ channel: NotificationChannel; success: boolean; deliveryRef?: string }[]> {
    const priority = params.priority || NotificationPriority.NORMAL;
    const channels = params.channels || [
      NotificationChannel.IN_APP,
      NotificationChannel.PUSH,
    ];

    const results: { channel: NotificationChannel; success: boolean; deliveryRef?: string }[] = [];

    // Retrieve active push token if PUSH is requested
    let pushTokenStr: string | undefined = undefined;
    if (channels.includes(NotificationChannel.PUSH)) {
      const tokenEntity = await this.pushTokenRepo.findOne({
        where: { userId: params.recipientId, isActive: true },
        order: { lastUsedAt: 'DESC' },
      });
      pushTokenStr = tokenEntity?.token;
    }

    for (const channel of channels) {
      // Check preferences if event is non-critical
      const canSend = await this.isChannelAllowed(params.recipientId, channel, params.eventType);
      if (!canSend) {
        this.logger.debug(`Notification silenced by user preference: User=${params.recipientId} Channel=${channel} Event=${params.eventType}`);
        continue;
      }

      const payload = {
        recipientId: params.recipientId,
        title: params.title,
        message: params.message,
        channel,
        eventType: params.eventType,
        priority,
        metadata: params.metadata,
        pushToken: pushTokenStr,
      };

      let result;
      switch (channel) {
        case NotificationChannel.IN_APP:
          result = await this.inAppProvider.send(payload);
          break;
        case NotificationChannel.PUSH:
          result = await this.pushProvider.send(payload);
          break;
        case NotificationChannel.EMAIL:
          result = await this.emailProvider.send(payload);
          break;
        case NotificationChannel.SMS:
          result = await this.smsProvider.send(payload);
          break;
      }

      if (result) {
        results.push({
          channel,
          success: result.success,
          deliveryRef: result.deliveryRef,
        });
      }
    }

    return results;
  }

  async listUserNotifications(
    userId: string,
    query: QueryNotificationsDto,
  ): Promise<{ notifications: NotificationEntity[]; total: number; unreadCount: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const qb = this.notificationRepo
      .createQueryBuilder('n')
      .where('n.recipientId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC');

    if (query.unreadOnly) {
      qb.andWhere('n.isRead = false');
    }

    const [notifications, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const unreadCount = await this.notificationRepo.count({
      where: { recipientId: userId, isRead: false },
    });

    return { notifications, total, unreadCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationEntity> {
    const notif = await this.notificationRepo.findOne({
      where: { id: notificationId, recipientId: userId },
    });
    if (!notif) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    notif.isRead = true;
    notif.readAt = new Date();
    return this.notificationRepo.save(notif);
  }

  async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
    const result = await this.notificationRepo.update(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { updatedCount: result.affected || 0 };
  }

  async registerPushToken(userId: string, dto: RegisterPushTokenDto): Promise<PushTokenEntity> {
    let token = await this.pushTokenRepo.findOne({
      where: { token: dto.token },
    });

    if (token) {
      token.userId = userId;
      token.platform = dto.platform;
      token.deviceId = dto.deviceId;
      token.isActive = true;
      token.lastUsedAt = new Date();
      return this.pushTokenRepo.save(token);
    }

    token = this.pushTokenRepo.create({
      userId,
      token: dto.token,
      platform: dto.platform,
      deviceId: dto.deviceId,
      isActive: true,
      lastUsedAt: new Date(),
    });

    return this.pushTokenRepo.save(token);
  }

  async unregisterPushToken(userId: string, tokenStr: string): Promise<{ success: boolean }> {
    await this.pushTokenRepo.update(
      { userId, token: tokenStr },
      { isActive: false },
    );
    return { success: true };
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferenceEntity[]> {
    return this.preferenceRepo.find({ where: { userId } });
  }

  async updatePreference(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferenceEntity> {
    if (this.CRITICAL_EVENTS.has(dto.eventType) && !dto.isEnabled) {
      throw new BadRequestException(`Cannot disable critical event notification: ${dto.eventType}`);
    }

    let pref = await this.preferenceRepo.findOne({
      where: {
        userId,
        channel: dto.channel,
        eventType: dto.eventType,
      },
    });

    if (pref) {
      pref.isEnabled = dto.isEnabled;
      return this.preferenceRepo.save(pref);
    }

    pref = this.preferenceRepo.create({
      userId,
      channel: dto.channel,
      eventType: dto.eventType,
      isEnabled: dto.isEnabled,
    });

    return this.preferenceRepo.save(pref);
  }

  private async isChannelAllowed(
    userId: string,
    channel: NotificationChannel,
    eventType: NotificationEventType,
  ): Promise<boolean> {
    // Critical events cannot be muted
    if (this.CRITICAL_EVENTS.has(eventType)) {
      return true;
    }

    const pref = await this.preferenceRepo.findOne({
      where: { userId, channel, eventType },
    });

    return pref ? pref.isEnabled : true;
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  NotificationEntity,
  PushTokenEntity,
  NotificationPreferenceEntity,
} from '../../database/entities';
import { InAppNotificationProvider } from './providers/in-app-notification.provider';
import { PushNotificationProvider } from './providers/push-notification.provider';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { SmsNotificationProvider } from './providers/sms-notification.provider';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      PushTokenEntity,
      NotificationPreferenceEntity,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    InAppNotificationProvider,
    PushNotificationProvider,
    EmailNotificationProvider,
    SmsNotificationProvider,
    NotificationService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}

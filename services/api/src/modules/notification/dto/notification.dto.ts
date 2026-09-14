import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
} from '@cshrk/types';

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'Push notification device token' })
  token: string;

  @ApiProperty({ enum: ['IOS', 'ANDROID', 'WEB'], default: 'ANDROID' })
  platform: 'IOS' | 'ANDROID' | 'WEB';

  @ApiPropertyOptional({ description: 'Hardware or client device ID' })
  deviceId?: string;
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({ enum: NotificationChannel })
  channel: NotificationChannel;

  @ApiProperty({ enum: NotificationEventType })
  eventType: NotificationEventType;

  @ApiProperty({ description: 'Whether notification is enabled' })
  isEnabled: boolean;
}

export class QueryNotificationsDto {
  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by read state' })
  unreadOnly?: boolean;
}

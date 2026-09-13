import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { NotificationChannel, NotificationEventType } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('notification_preferences')
@Index(['userId', 'channel', 'eventType'], { unique: true })
export class NotificationPreferenceEntity extends CshrkBaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: NotificationEventType,
  })
  eventType: NotificationEventType;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;
}

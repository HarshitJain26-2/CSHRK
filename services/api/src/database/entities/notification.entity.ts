import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import {
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
} from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('notifications')
@Index(['recipientId', 'createdAt'])
@Index(['recipientId', 'isRead'])
export class NotificationEntity extends CshrkBaseEntity {
  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: UserEntity;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: NotificationEventType,
  })
  eventType: NotificationEventType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}

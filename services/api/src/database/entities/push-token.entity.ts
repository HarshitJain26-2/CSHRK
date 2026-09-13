import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('push_tokens')
@Index(['userId', 'platform'])
@Index(['token'], { unique: true })
export class PushTokenEntity extends CshrkBaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'varchar', length: 20 })
  platform: 'IOS' | 'ANDROID' | 'WEB';

  @Column({ name: 'device_id', type: 'varchar', length: 100, nullable: true })
  deviceId?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;
}

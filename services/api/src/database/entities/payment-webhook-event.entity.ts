import { Entity, Column, Index } from 'typeorm';
import { CshrkBaseEntity } from '../../common/entities/base.entity';

@Entity('payment_webhook_events')
export class PaymentWebhookEventEntity extends CshrkBaseEntity {
  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @Index({ unique: true })
  @Column({ name: 'event_id', type: 'varchar', length: 255, unique: true })
  eventId: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  signature?: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_processed', type: 'boolean', default: false })
  isProcessed: boolean;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt?: Date;
}

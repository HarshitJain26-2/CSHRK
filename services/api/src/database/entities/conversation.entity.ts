import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { ConversationType, ConversationStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { WorkerEntity } from './worker.entity';
import { CustomerEntity } from './customer.entity';
import { CooperativeEntity } from './cooperative.entity';
import { FederationEntity } from './federation.entity';
import { BookingEntity } from './booking.entity';
import { MessageEntity } from './message.entity';

@Entity('conversations')
@Index(['bookingId'], { unique: true, where: '"booking_id" IS NOT NULL' })
export class ConversationEntity extends CshrkBaseEntity {
  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.BOOKING,
  })
  type: ConversationType;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId?: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: CustomerEntity;

  @Column({ name: 'worker_id', type: 'uuid', nullable: true })
  workerId?: string;

  @ManyToOne(() => WorkerEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'worker_id' })
  worker?: WorkerEntity;

  @Column({ name: 'cooperative_id', type: 'uuid', nullable: true })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative?: CooperativeEntity;

  @Column({ name: 'federation_id', type: 'uuid', nullable: true })
  federationId?: string;

  @ManyToOne(() => FederationEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'federation_id' })
  federation?: FederationEntity;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId?: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking?: BookingEntity;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId?: string;

  @Column({ name: 'dispute_id', type: 'uuid', nullable: true })
  disputeId?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  title?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt?: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[];
}

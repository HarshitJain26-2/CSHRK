import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RefundStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { PaymentEntity } from './payment.entity';

@Entity('refunds')
export class RefundEntity extends CshrkBaseEntity {
  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId: string;

  @ManyToOne(() => PaymentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({ name: 'provider_refund_id', type: 'varchar', length: 255, nullable: true })
  providerRefundId?: string;

  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById?: string;
}

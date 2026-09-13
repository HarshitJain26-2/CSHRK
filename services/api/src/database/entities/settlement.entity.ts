import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SettlementStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { CooperativeEntity } from './cooperative.entity';
import { WorkerEntity } from './worker.entity';

@Entity('settlements')
export class SettlementEntity extends CshrkBaseEntity {
  @Column({ name: 'cooperative_id', type: 'uuid' })
  cooperativeId: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative: CooperativeEntity;

  @Column({ name: 'worker_id', type: 'uuid' })
  workerId: string;

  @ManyToOne(() => WorkerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'worker_id' })
  worker: WorkerEntity;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId?: string;

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId?: string;

  @Column({ name: 'financial_policy_id', type: 'uuid', nullable: true })
  financialPolicyId?: string;

  @Column({ name: 'policy_version_applied', type: 'varchar', length: 50, nullable: true })
  policyVersionApplied?: string;

  @Column({ name: 'gross_amount', type: 'decimal', precision: 10, scale: 2 })
  grossAmount: number;

  @Column({ name: 'worker_amount', type: 'decimal', precision: 10, scale: 2 })
  workerAmount: number;

  @Column({ name: 'cooperative_fee', type: 'decimal', precision: 10, scale: 2 })
  cooperativeFee: number;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 10, scale: 2 })
  platformFee: number;

  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
  })
  status: SettlementStatus;

  @Column({ name: 'period_start', type: 'timestamptz', nullable: true })
  periodStart?: Date;

  @Column({ name: 'period_end', type: 'timestamptz', nullable: true })
  periodEnd?: Date;

  @Column({ name: 'paid_out_at', type: 'timestamptz', nullable: true })
  paidOutAt?: Date;

  @Column({ name: 'payout_reference', type: 'varchar', length: 255, nullable: true })
  payoutReference?: string;
}

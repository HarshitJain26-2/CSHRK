import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AllocationApprovalStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { FulfillmentPlanEntity } from './fulfillment-plan.entity';
import { CooperativeEntity } from './cooperative.entity';

@Entity('fulfillment_allocations')
export class FulfillmentAllocationEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @ManyToOne(() => FulfillmentPlanEntity, (plan) => plan.allocations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: FulfillmentPlanEntity;

  @Index()
  @Column({ name: 'cooperative_id', type: 'uuid' })
  cooperativeId: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative: CooperativeEntity;

  @Column({ name: 'allocated_workers', type: 'int' })
  allocatedWorkers: number;

  @Column({
    type: 'enum',
    enum: AllocationApprovalStatus,
    default: AllocationApprovalStatus.PENDING_APPROVAL,
  })
  status: AllocationApprovalStatus;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;
}

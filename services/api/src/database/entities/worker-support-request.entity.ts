import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SupportRequestCategory, SupportRequestStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { WorkerEntity } from './worker.entity';
import { CooperativeEntity } from './cooperative.entity';
import { UserEntity } from './user.entity';

@Entity('worker_support_requests')
@Index(['workerId'])
@Index(['cooperativeId', 'status'])
export class WorkerSupportRequestEntity extends CshrkBaseEntity {
  @Column({ name: 'worker_id', type: 'uuid' })
  workerId: string;

  @ManyToOne(() => WorkerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'worker_id' })
  worker: WorkerEntity;

  @Column({ name: 'cooperative_id', type: 'uuid' })
  cooperativeId: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative: CooperativeEntity;

  @Column({
    type: 'enum',
    enum: SupportRequestCategory,
  })
  category: SupportRequestCategory;

  @Column({
    type: 'enum',
    enum: SupportRequestStatus,
    default: SupportRequestStatus.SUBMITTED,
  })
  status: SupportRequestStatus;

  @Column({ type: 'varchar', length: 150 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'action_taken', type: 'text', nullable: true })
  actionTaken?: string;

  @Column({ name: 'reviewed_by_id', type: 'uuid', nullable: true })
  reviewedById?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy?: UserEntity;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;
}

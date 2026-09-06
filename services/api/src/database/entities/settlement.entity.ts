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

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

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
}

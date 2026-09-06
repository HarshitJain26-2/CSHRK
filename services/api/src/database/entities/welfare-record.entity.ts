import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { WorkerEntity } from './worker.entity';
import { CooperativeEntity } from './cooperative.entity';

@Entity('welfare_records')
export class WelfareRecordEntity extends CshrkBaseEntity {
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

  @Column({ type: 'varchar', length: 100 })
  schemeName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;
}

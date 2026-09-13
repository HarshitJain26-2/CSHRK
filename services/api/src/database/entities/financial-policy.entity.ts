import { Entity, Column, Index } from 'typeorm';
import { FinancialPolicyStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';

@Entity('financial_policies')
export class FinancialPolicyEntity extends CshrkBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  version: string;

  @Column({ name: 'effective_from', type: 'timestamptz' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'timestamptz', nullable: true })
  effectiveTo?: Date;

  @Column({ name: 'worker_share_pct', type: 'decimal', precision: 5, scale: 4 })
  workerSharePct: number;

  @Column({ name: 'cooperative_share_pct', type: 'decimal', precision: 5, scale: 4 })
  cooperativeSharePct: number;

  @Column({ name: 'platform_fee_pct', type: 'decimal', precision: 5, scale: 4 })
  platformFeePct: number;

  @Column({
    type: 'enum',
    enum: FinancialPolicyStatus,
    default: FinancialPolicyStatus.ACTIVE,
  })
  status: FinancialPolicyStatus;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

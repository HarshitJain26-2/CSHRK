import { Entity, Column } from 'typeorm';
import { ReconciliationDiscrepancyType, ReconciliationResolutionStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';

@Entity('reconciliation_records')
export class ReconciliationRecordEntity extends CshrkBaseEntity {
  @Column({ name: 'period_start', type: 'timestamptz' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamptz' })
  periodEnd: Date;

  @Column({
    name: 'discrepancy_type',
    type: 'enum',
    enum: ReconciliationDiscrepancyType,
    default: ReconciliationDiscrepancyType.MATCHED,
  })
  discrepancyType: ReconciliationDiscrepancyType;

  @Column({ name: 'platform_payment_id', type: 'varchar', length: 255, nullable: true })
  platformPaymentId?: string;

  @Column({ name: 'gateway_transaction_id', type: 'varchar', length: 255, nullable: true })
  gatewayTransactionId?: string;

  @Column({ name: 'platform_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  platformAmount?: number;

  @Column({ name: 'gateway_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  gatewayAmount?: number;

  @Column({ name: 'amount_diff', type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountDiff?: number;

  @Column({
    name: 'resolution_status',
    type: 'enum',
    enum: ReconciliationResolutionStatus,
    default: ReconciliationResolutionStatus.UNRESOLVED,
  })
  resolutionStatus: ReconciliationResolutionStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

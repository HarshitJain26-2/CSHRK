import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { FulfillmentPlanStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { WorkforceRequirementEntity } from './workforce-requirement.entity';
import { FederationEntity } from './federation.entity';
import { FulfillmentAllocationEntity } from './fulfillment-allocation.entity';

@Entity('fulfillment_plans')
export class FulfillmentPlanEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'requirement_id', type: 'uuid' })
  requirementId: string;

  @ManyToOne(() => WorkforceRequirementEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requirement_id' })
  requirement: WorkforceRequirementEntity;

  @Index()
  @Column({ name: 'federation_id', type: 'uuid' })
  federationId: string;

  @ManyToOne(() => FederationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'federation_id' })
  federation: FederationEntity;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    type: 'enum',
    enum: FulfillmentPlanStatus,
    default: FulfillmentPlanStatus.PROPOSED,
  })
  status: FulfillmentPlanStatus;

  @OneToMany(() => FulfillmentAllocationEntity, (alloc) => alloc.plan, { cascade: true })
  allocations: FulfillmentAllocationEntity[];
}

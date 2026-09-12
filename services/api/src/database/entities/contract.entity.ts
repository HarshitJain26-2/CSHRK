import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ContractStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { CooperativeEntity } from './cooperative.entity';
import { FederationEntity } from './federation.entity';

@Entity('contracts')
export class ContractEntity extends CshrkBaseEntity {
  @Index({ unique: true })
  @Column({ name: 'contract_number', type: 'varchar', length: 100, unique: true })
  contractNumber: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'client_name', type: 'varchar', length: 255 })
  clientName: string;

  @Column({ name: 'client_contact', type: 'varchar', length: 255, nullable: true })
  clientContact?: string;

  @Index()
  @Column({ name: 'cooperative_id', type: 'uuid', nullable: true })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative?: CooperativeEntity;

  @Index()
  @Column({ name: 'federation_id', type: 'uuid', nullable: true })
  federationId?: string;

  @ManyToOne(() => FederationEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'federation_id' })
  federation?: FederationEntity;

  @Column({ type: 'text' })
  scope: string;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  status: ContractStatus;
}

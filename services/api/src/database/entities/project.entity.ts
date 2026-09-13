import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { ProjectStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { CooperativeEntity } from './cooperative.entity';
import { ContractEntity } from './contract.entity';
import { WorkerTeamEntity } from './worker-team.entity';

@Entity('projects')
export class ProjectEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId?: string;

  @ManyToOne(() => ContractEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'contract_id' })
  contract?: ContractEntity;

  @Index()
  @Column({ name: 'cooperative_id', type: 'uuid' })
  cooperativeId: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative: CooperativeEntity;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @OneToMany(() => WorkerTeamEntity, (team) => team.projectId)
  teams?: WorkerTeamEntity[];
}

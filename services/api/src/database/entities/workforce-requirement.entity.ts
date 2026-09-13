import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { RequirementStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { ContractEntity } from './contract.entity';
import { ProjectEntity } from './project.entity';
import { SkillEntity } from './skill.entity';

@Entity('workforce_requirements')
export class WorkforceRequirementEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId?: string;

  @ManyToOne(() => ContractEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'contract_id' })
  contract?: ContractEntity;

  @Index()
  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId?: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project?: ProjectEntity;

  @Index()
  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @ManyToOne(() => SkillEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'skill_id' })
  skill: SkillEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'fulfilled_quantity', type: 'int', default: 0 })
  fulfilledQuantity: number;

  @Column({ name: 'location_city', type: 'varchar', length: 100 })
  locationCity: string;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: RequirementStatus,
    default: RequirementStatus.PENDING,
  })
  status: RequirementStatus;
}

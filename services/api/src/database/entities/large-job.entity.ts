import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { JobStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { CooperativeEntity } from './cooperative.entity';
import { ProjectEntity } from './project.entity';
import { SkillEntity } from './skill.entity';

@Entity('large_jobs')
export class LargeJobEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId?: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project?: ProjectEntity;

  @Index()
  @Column({ name: 'cooperative_id', type: 'uuid' })
  cooperativeId: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative: CooperativeEntity;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'organization_name', type: 'varchar', length: 255 })
  organizationName: string;

  @Index()
  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @ManyToOne(() => SkillEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'skill_id' })
  skill: SkillEntity;

  @Column({ name: 'required_workers', type: 'int' })
  requiredWorkers: number;

  @Column({ name: 'assigned_workers', type: 'int', default: 0 })
  assignedWorkers: number;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate: Date;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  status: JobStatus;
}

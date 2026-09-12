import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { TeamStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { CooperativeEntity } from './cooperative.entity';
import { WorkerEntity } from './worker.entity';
import { TeamMemberEntity } from './team-member.entity';

@Entity('worker_teams')
export class WorkerTeamEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'cooperative_id', type: 'uuid' })
  cooperativeId: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative: CooperativeEntity;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'leader_worker_id', type: 'uuid', nullable: true })
  leaderWorkerId?: string;

  @ManyToOne(() => WorkerEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'leader_worker_id' })
  leader?: WorkerEntity;

  @Column({
    type: 'enum',
    enum: TeamStatus,
    default: TeamStatus.ACTIVE,
  })
  status: TeamStatus;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId?: string;

  @OneToMany(() => TeamMemberEntity, (member) => member.team, { cascade: true })
  members: TeamMemberEntity[];
}

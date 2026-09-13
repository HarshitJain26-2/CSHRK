import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TeamMemberRole } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { WorkerTeamEntity } from './worker-team.entity';
import { WorkerEntity } from './worker.entity';

@Entity('team_members')
export class TeamMemberEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @ManyToOne(() => WorkerTeamEntity, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: WorkerTeamEntity;

  @Index()
  @Column({ name: 'worker_id', type: 'uuid' })
  workerId: string;

  @ManyToOne(() => WorkerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'worker_id' })
  worker: WorkerEntity;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
    default: TeamMemberRole.MEMBER,
  })
  role: TeamMemberRole;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;
}

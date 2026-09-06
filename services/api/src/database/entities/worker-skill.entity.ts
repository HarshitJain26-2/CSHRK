import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ProficiencyLevel } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { WorkerEntity } from './worker.entity';
import { SkillEntity } from './skill.entity';

@Entity('worker_skills')
@Unique(['workerId', 'skillId'])
export class WorkerSkillEntity extends CshrkBaseEntity {
  @Column({ name: 'worker_id', type: 'uuid' })
  workerId: string;

  @ManyToOne(() => WorkerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'worker_id' })
  worker: WorkerEntity;

  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @ManyToOne(() => SkillEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill: SkillEntity;

  @Column({
    name: 'proficiency_level',
    type: 'enum',
    enum: ProficiencyLevel,
    default: ProficiencyLevel.BEGINNER,
  })
  proficiencyLevel: ProficiencyLevel;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;
}

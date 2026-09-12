import { Entity, Column, OneToOne, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import {
  AccountStatus,
  WorkerAvailabilityStatus,
  WorkerEmploymentType,
} from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';
import { CooperativeEntity } from './cooperative.entity';
import { WorkerSkillEntity } from './worker-skill.entity';
import { CertificationEntity } from './certification.entity';

@Entity('workers')
export class WorkerEntity extends CshrkBaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'cooperative_id', type: 'uuid' })
  cooperativeId: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative: CooperativeEntity;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ name: 'member_id', type: 'varchar', length: 100, nullable: true })
  memberId?: string;

  @Column({
    name: 'employment_type',
    type: 'enum',
    enum: WorkerEmploymentType,
    default: WorkerEmploymentType.MEMBER_WORKER,
  })
  employmentType: WorkerEmploymentType;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @Column({
    name: 'availability_status',
    type: 'enum',
    enum: WorkerAvailabilityStatus,
    default: WorkerAvailabilityStatus.AVAILABLE,
  })
  availabilityStatus: WorkerAvailabilityStatus;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  currentLocation?: any;

  @Column({
    name: 'rating_avg',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 5.0,
  })
  ratingAvg: number;

  @Column({ name: 'total_jobs', type: 'int', default: 0 })
  totalJobs: number;

  @OneToMany(() => WorkerSkillEntity, (ws) => ws.worker)
  workerSkills: WorkerSkillEntity[];

  @OneToMany(() => CertificationEntity, (cert) => cert.worker)
  certifications: CertificationEntity[];
}

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { MembershipStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';
import { CooperativeEntity } from './cooperative.entity';
import { WorkerEntity } from './worker.entity';

@Entity('cooperative_memberships')
export class CooperativeMembershipEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Index()
  @Column({ name: 'cooperative_id', type: 'uuid' })
  cooperativeId: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative: CooperativeEntity;

  @Column({ name: 'worker_id', type: 'uuid', nullable: true })
  workerId?: string;

  @ManyToOne(() => WorkerEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'worker_id' })
  worker?: WorkerEntity;

  @Column({ name: 'member_id', type: 'varchar', length: 100, nullable: true })
  memberId?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'MEMBER_WORKER',
  })
  role: string;

  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.PENDING,
  })
  status: MembershipStatus;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @Column({ name: 'left_at', type: 'timestamptz', nullable: true })
  leftAt?: Date;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

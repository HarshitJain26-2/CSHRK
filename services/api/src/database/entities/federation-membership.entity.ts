import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { MembershipStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';
import { FederationEntity } from './federation.entity';

@Entity('federation_memberships')
export class FederationMembershipEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Index()
  @Column({ name: 'federation_id', type: 'uuid' })
  federationId: string;

  @ManyToOne(() => FederationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'federation_id' })
  federation: FederationEntity;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'FEDERATION_ADMIN',
  })
  role: string;

  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @Column({ name: 'left_at', type: 'timestamptz', nullable: true })
  leftAt?: Date;
}

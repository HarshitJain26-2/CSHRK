import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AccountRestrictionType } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('account_restrictions')
@Index(['userId', 'isActive'])
export class AccountRestrictionEntity extends CshrkBaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'restriction_type',
    type: 'enum',
    enum: AccountRestrictionType,
  })
  restrictionType: AccountRestrictionType;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'issued_by_id', type: 'uuid' })
  issuedById: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issued_by_id' })
  issuedBy: UserEntity;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  @Column({ name: 'revocation_reason', type: 'text', nullable: true })
  revocationReason?: string;
}

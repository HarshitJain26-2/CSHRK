import { Entity, Column, Index } from 'typeorm';
import { UserRole, AccountStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';

@Entity('users')
export class UserEntity extends CshrkBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;
}

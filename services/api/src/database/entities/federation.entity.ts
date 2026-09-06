import { Entity, Column, Index } from 'typeorm';
import { AccountStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';

@Entity('federations')
export class FederationEntity extends CshrkBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255 })
  contactEmail: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 30, nullable: true })
  contactPhone?: string;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;
}

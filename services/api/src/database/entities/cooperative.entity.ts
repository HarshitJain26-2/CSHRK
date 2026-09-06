import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AccountStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { FederationEntity } from './federation.entity';

@Entity('cooperatives')
export class CooperativeEntity extends CshrkBaseEntity {
  @Column({ name: 'federation_id', type: 'uuid' })
  federationId: string;

  @ManyToOne(() => FederationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'federation_id' })
  federation: FederationEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ name: 'registration_number', type: 'varchar', length: 100, unique: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255 })
  contactEmail: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 30, nullable: true })
  contactPhone?: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  serviceBoundary?: any;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;
}

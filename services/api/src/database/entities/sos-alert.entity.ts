import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { SosCategory, SosPriority, SosStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';
import { BookingEntity } from './booking.entity';
import { CooperativeEntity } from './cooperative.entity';
import { SosUpdateEntity } from './sos-update.entity';

@Entity('sos_alerts')
@Index(['status'])
@Index(['cooperativeId', 'status'])
export class SosAlertEntity extends CshrkBaseEntity {
  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: UserEntity;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId?: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking?: BookingEntity;

  @Column({ name: 'cooperative_id', type: 'uuid', nullable: true })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative?: CooperativeEntity;

  @Column({
    type: 'enum',
    enum: SosCategory,
    default: SosCategory.PHYSICAL_SAFETY,
  })
  category: SosCategory;

  @Column({
    type: 'enum',
    enum: SosPriority,
    default: SosPriority.CRITICAL,
  })
  priority: SosPriority;

  @Column({
    type: 'enum',
    enum: SosStatus,
    default: SosStatus.TRIGGERED,
  })
  status: SosStatus;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: any;

  @Column({ name: 'address_text', type: 'varchar', length: 500, nullable: true })
  addressText?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'assigned_responder_id', type: 'uuid', nullable: true })
  assignedResponderId?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_responder_id' })
  assignedResponder?: UserEntity;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ name: 'is_location_redacted', type: 'boolean', default: false })
  isLocationRedacted: boolean;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @OneToMany(() => SosUpdateEntity, (update) => update.sosAlert, { cascade: true })
  updates: SosUpdateEntity[];
}

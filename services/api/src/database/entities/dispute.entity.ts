import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { DisputeStatus, DisputeResolution } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { BookingEntity } from './booking.entity';
import { UserEntity } from './user.entity';
import { CooperativeEntity } from './cooperative.entity';
import { DisputeEvidenceEntity } from './dispute-evidence.entity';

@Entity('disputes')
@Index(['bookingId'])
export class DisputeEntity extends CshrkBaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @Column({ name: 'initiator_id', type: 'uuid' })
  initiatorId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'initiator_id' })
  initiator: UserEntity;

  @Column({ name: 'respondent_id', type: 'uuid', nullable: true })
  respondentId?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'respondent_id' })
  respondent?: UserEntity;

  @Column({ name: 'cooperative_id', type: 'uuid', nullable: true })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative?: CooperativeEntity;

  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.OPEN,
  })
  status: DisputeStatus;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'disputed_amount', type: 'decimal', precision: 10, scale: 2 })
  disputedAmount: number;

  @Column({
    type: 'enum',
    enum: DisputeResolution,
    nullable: true,
  })
  resolution?: DisputeResolution;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ name: 'resolved_by_id', type: 'uuid', nullable: true })
  resolvedById?: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'resolved_by_id' })
  resolvedBy?: UserEntity;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @OneToMany(() => DisputeEvidenceEntity, (evidence) => evidence.dispute, { cascade: true })
  evidences: DisputeEvidenceEntity[];
}

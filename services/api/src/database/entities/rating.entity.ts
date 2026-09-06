import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { BookingEntity } from './booking.entity';
import { UserEntity } from './user.entity';

@Entity('ratings')
export class RatingEntity extends CshrkBaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @Column({ name: 'reviewer_id', type: 'uuid' })
  reviewerId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: UserEntity;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_id' })
  target: UserEntity;

  @Column({ type: 'int' })
  score: number; // 1 to 5

  @Column({ type: 'text', nullable: true })
  comment?: string;
}

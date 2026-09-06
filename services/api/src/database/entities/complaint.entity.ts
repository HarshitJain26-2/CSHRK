import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ComplaintStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { BookingEntity } from './booking.entity';
import { UserEntity } from './user.entity';

@Entity('complaints')
export class ComplaintEntity extends CshrkBaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @Column({ name: 'raised_by_id', type: 'uuid' })
  raisedById: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raised_by_id' })
  raisedBy: UserEntity;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.OPEN,
  })
  status: ComplaintStatus;
}

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { BookingEntity } from './booking.entity';

@Entity('payments')
export class PaymentEntity extends CshrkBaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ name: 'transaction_ref', type: 'varchar', length: 255, nullable: true })
  transactionRef?: string;
}

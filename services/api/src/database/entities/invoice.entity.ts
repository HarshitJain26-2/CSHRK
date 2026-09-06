import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { InvoiceStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { BookingEntity } from './booking.entity';

@Entity('invoices')
export class InvoiceEntity extends CshrkBaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => BookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @Index({ unique: true })
  @Column({ name: 'invoice_number', type: 'varchar', length: 100, unique: true })
  invoiceNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  tax: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.ISSUED,
  })
  status: InvoiceStatus;
}

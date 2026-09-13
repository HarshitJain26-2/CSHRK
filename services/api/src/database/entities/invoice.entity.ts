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

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId?: string;

  @Column({ name: 'cooperative_id', type: 'uuid', nullable: true })
  cooperativeId?: string;

  @Index({ unique: true })
  @Column({ name: 'invoice_number', type: 'varchar', length: 100, unique: true })
  invoiceNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  discountAmount: number;

  @Column({ name: 'taxable_amount', type: 'decimal', precision: 10, scale: 2 })
  taxableAmount: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 4, default: 0.18 })
  taxRate: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.ISSUED,
  })
  status: InvoiceStatus;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

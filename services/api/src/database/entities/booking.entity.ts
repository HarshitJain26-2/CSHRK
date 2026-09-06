import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BookingStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { ServiceRequestEntity } from './service-request.entity';
import { CustomerEntity } from './customer.entity';
import { WorkerEntity } from './worker.entity';
import { CooperativeEntity } from './cooperative.entity';

@Entity('bookings')
export class BookingEntity extends CshrkBaseEntity {
  @Column({ name: 'service_request_id', type: 'uuid' })
  serviceRequestId: string;

  @ManyToOne(() => ServiceRequestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_request_id' })
  serviceRequest: ServiceRequestEntity;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'worker_id', type: 'uuid', nullable: true })
  workerId?: string;

  @ManyToOne(() => WorkerEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'worker_id' })
  worker?: WorkerEntity;

  @Column({ name: 'cooperative_id', type: 'uuid', nullable: true })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cooperative_id' })
  cooperative?: CooperativeEntity;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  totalAmount: number;

  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  startTime?: Date;

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime?: Date;
}

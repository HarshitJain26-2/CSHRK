import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceRequestStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { CustomerEntity } from './customer.entity';
import { ServiceEntity } from './service.entity';

@Entity('service_requests')
export class ServiceRequestEntity extends CshrkBaseEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => ServiceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: any;

  @Column({ name: 'scheduled_time', type: 'timestamptz', nullable: true })
  scheduledTime?: Date;

  @Column({
    type: 'enum',
    enum: ServiceRequestStatus,
    default: ServiceRequestStatus.PENDING,
  })
  status: ServiceRequestStatus;
}

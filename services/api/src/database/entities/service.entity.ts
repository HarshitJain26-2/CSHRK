import { Entity, Column } from 'typeorm';
import { CshrkBaseEntity } from '../../common/entities/base.entity';

@Entity('services')
export class ServiceEntity extends CshrkBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'varchar', length: 50, default: 'HOUR' })
  unit: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SosStatus } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { SosAlertEntity } from './sos-alert.entity';
import { UserEntity } from './user.entity';

@Entity('sos_updates')
export class SosUpdateEntity extends CshrkBaseEntity {
  @Column({ name: 'sos_alert_id', type: 'uuid' })
  sosAlertId: string;

  @ManyToOne(() => SosAlertEntity, (alert) => alert.updates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sos_alert_id' })
  sosAlert: SosAlertEntity;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @Column({ type: 'text' })
  note: string;

  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: SosStatus,
    nullable: true,
  })
  previousStatus?: SosStatus;

  @Column({
    name: 'new_status',
    type: 'enum',
    enum: SosStatus,
    nullable: true,
  })
  newStatus?: SosStatus;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: any;
}

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IAttachmentMetadata } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { DisputeEntity } from './dispute.entity';
import { UserEntity } from './user.entity';

@Entity('dispute_evidences')
export class DisputeEvidenceEntity extends CshrkBaseEntity {
  @Column({ name: 'dispute_id', type: 'uuid' })
  disputeId: string;

  @ManyToOne(() => DisputeEntity, (dispute) => dispute.evidences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispute_id' })
  dispute: DisputeEntity;

  @Column({ name: 'submitted_by_id', type: 'uuid' })
  submittedById: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submitted_by_id' })
  submittedBy: UserEntity;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'attachment_json', type: 'jsonb' })
  attachmentJson: IAttachmentMetadata;
}

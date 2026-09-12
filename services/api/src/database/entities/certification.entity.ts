import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { WorkerEntity } from './worker.entity';

export enum CertificationStatus {
  VALID = 'valid',
  EXPIRING = 'expiring',
  EXPIRED = 'expired',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

@Entity('certifications')
export class CertificationEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'worker_id', type: 'uuid' })
  workerId: string;

  @ManyToOne(() => WorkerEntity, (worker) => worker.certifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'worker_id' })
  worker: WorkerEntity;

  @Column({ name: 'certification_name', type: 'varchar', length: 255 })
  certificationName: string;

  @Column({ name: 'issuing_organization', type: 'varchar', length: 255 })
  issuingOrganization: string;

  @Column({ name: 'credential_number', type: 'varchar', length: 150 })
  credentialNumber: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: string;

  @Column({
    type: 'enum',
    enum: CertificationStatus,
    default: CertificationStatus.PENDING,
  })
  status: CertificationStatus;

  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes?: string;

  @Column({ name: 'document_url', type: 'varchar', length: 500, nullable: true })
  documentUrl?: string;
}

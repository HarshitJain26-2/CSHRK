import { Entity, Column, Index } from 'typeorm';
import { CshrkBaseEntity } from '../../common/entities/base.entity';

@Entity('ai_model_versions')
export class AIModelVersionEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'model_name', type: 'varchar', length: 100 })
  modelName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  version: string;

  @Column({ name: 'feature_schema', type: 'jsonb', nullable: true })
  featureSchema?: Record<string, any>;

  @Column({ name: 'training_dataset_ref', type: 'varchar', length: 255, nullable: true })
  trainingDatasetRef?: string;

  @Column({ name: 'evaluation_metrics', type: 'jsonb', nullable: true })
  evaluationMetrics?: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;
}

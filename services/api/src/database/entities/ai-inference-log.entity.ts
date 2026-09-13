import { Entity, Column, Index } from 'typeorm';
import { CshrkBaseEntity } from '../../common/entities/base.entity';

@Entity('ai_inference_logs')
export class AIInferenceLogEntity extends CshrkBaseEntity {
  @Index()
  @Column({ name: 'task_type', type: 'varchar', length: 50 })
  taskType: string;

  @Column({ name: 'model_version', type: 'varchar', length: 50 })
  modelVersion: string;

  @Index()
  @Column({ name: 'input_hash', type: 'varchar', length: 64 })
  inputHash: string;

  @Column({ name: 'output_summary', type: 'jsonb', nullable: true })
  outputSummary?: Record<string, any>;

  @Column({ name: 'latency_ms', type: 'integer' })
  latencyMs: number;

  @Column({ name: 'fallback_used', type: 'boolean', default: false })
  fallbackUsed: boolean;
}

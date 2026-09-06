import { Entity, Column, Index } from 'typeorm';
import { CshrkBaseEntity } from '../../common/entities/base.entity';

@Entity('skills')
export class SkillEntity extends CshrkBaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}

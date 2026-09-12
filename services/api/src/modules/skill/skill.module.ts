import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { SkillEntity } from '../../database/entities/skill.entity';
import { WorkerSkillEntity } from '../../database/entities/worker-skill.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SkillEntity, WorkerSkillEntity, WorkerEntity])],
  controllers: [SkillController],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}

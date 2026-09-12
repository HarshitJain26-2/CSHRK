import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { WorkerSkillEntity } from '../../database/entities/worker-skill.entity';
import { SkillEntity } from '../../database/entities/skill.entity';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { BookingEntity } from '../../database/entities/booking.entity';
import { CertificationEntity } from '../../database/entities/certification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkerEntity,
      WorkerSkillEntity,
      SkillEntity,
      CooperativeEntity,
      BookingEntity,
      CertificationEntity,
    ]),
  ],
  controllers: [WorkerController],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerModule {}

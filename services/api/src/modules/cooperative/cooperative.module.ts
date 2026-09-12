import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CooperativeController } from './cooperative.controller';
import { CooperativeService } from './cooperative.service';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CooperativeMembershipEntity } from '../../database/entities/cooperative-membership.entity';
import { FederationMembershipEntity } from '../../database/entities/federation-membership.entity';
import { BookingEntity } from '../../database/entities/booking.entity';
import { SkillEntity } from '../../database/entities/skill.entity';
import { WorkerSkillEntity } from '../../database/entities/worker-skill.entity';
import { WelfareRecordEntity } from '../../database/entities/welfare-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CooperativeEntity,
      WorkerEntity,
      CooperativeMembershipEntity,
      FederationMembershipEntity,
      BookingEntity,
      SkillEntity,
      WorkerSkillEntity,
      WelfareRecordEntity,
    ]),
  ],
  controllers: [CooperativeController],
  providers: [CooperativeService],
  exports: [CooperativeService],
})
export class CooperativeModule {}

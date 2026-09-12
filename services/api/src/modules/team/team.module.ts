import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { WorkerTeamEntity } from '../../database/entities/worker-team.entity';
import { TeamMemberEntity } from '../../database/entities/team-member.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CooperativeModule } from '../cooperative/cooperative.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkerTeamEntity,
      TeamMemberEntity,
      WorkerEntity,
    ]),
    CooperativeModule,
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}

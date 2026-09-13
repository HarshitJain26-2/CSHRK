import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgOperationsController } from './org-operations.controller';
import { OrgOperationsService } from './org-operations.service';
import { ContractEntity } from '../../database/entities/contract.entity';
import { ProjectEntity } from '../../database/entities/project.entity';
import { LargeJobEntity } from '../../database/entities/large-job.entity';
import { WorkforceRequirementEntity } from '../../database/entities/workforce-requirement.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CooperativeModule } from '../cooperative/cooperative.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractEntity,
      ProjectEntity,
      LargeJobEntity,
      WorkforceRequirementEntity,
      WorkerEntity,
    ]),
    CooperativeModule,
  ],
  controllers: [OrgOperationsController],
  providers: [OrgOperationsService],
  exports: [OrgOperationsService],
})
export class OrgOperationsModule {}

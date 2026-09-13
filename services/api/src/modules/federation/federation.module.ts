import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FederationController } from './federation.controller';
import { FederationService } from './federation.service';
import { FederationEntity } from '../../database/entities/federation.entity';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { FederationMembershipEntity } from '../../database/entities/federation-membership.entity';
import { CooperativeMembershipEntity } from '../../database/entities/cooperative-membership.entity';
import { WorkforceRequirementEntity } from '../../database/entities/workforce-requirement.entity';
import { FulfillmentPlanEntity } from '../../database/entities/fulfillment-plan.entity';
import { FulfillmentAllocationEntity } from '../../database/entities/fulfillment-allocation.entity';
import { CooperativeModule } from '../cooperative/cooperative.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FederationEntity,
      CooperativeEntity,
      WorkerEntity,
      FederationMembershipEntity,
      CooperativeMembershipEntity,
      WorkforceRequirementEntity,
      FulfillmentPlanEntity,
      FulfillmentAllocationEntity,
    ]),
    CooperativeModule,
  ],
  controllers: [FederationController],
  providers: [FederationService],
  exports: [FederationService],
})
export class FederationModule {}

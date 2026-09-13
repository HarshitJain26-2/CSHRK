import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestEntity } from '../../database/entities/service-request.entity';
import { ServiceEntity } from '../../database/entities/service.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CustomerModule } from '../customer/customer.module';

import { AIClientModule } from '../ai-client/ai-client.module';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequestService } from './service-request.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceRequestEntity,
      ServiceEntity,
      WorkerEntity,
    ]),
    CustomerModule,
    AIClientModule,
  ],

  controllers: [ServiceRequestController],
  providers: [ServiceRequestService],
  exports: [ServiceRequestService],
})
export class ServiceRequestModule {}

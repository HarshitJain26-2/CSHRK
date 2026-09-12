import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../../database/entities/booking.entity';
import { ServiceRequestEntity } from '../../database/entities/service-request.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { RatingEntity } from '../../database/entities/rating.entity';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { CustomerModule } from '../customer/customer.module';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      ServiceRequestEntity,
      WorkerEntity,
      RatingEntity,
      CustomerEntity,
    ]),
    CustomerModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}

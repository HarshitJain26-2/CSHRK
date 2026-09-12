import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CooperativeController } from './cooperative.controller';
import { CooperativeService } from './cooperative.service';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CooperativeEntity, WorkerEntity])],
  controllers: [CooperativeController],
  providers: [CooperativeService],
  exports: [CooperativeService],
})
export class CooperativeModule {}

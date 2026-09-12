import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificationController } from './certification.controller';
import { CertificationService } from './certification.service';
import { CertificationEntity } from '../../database/entities/certification.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CertificationEntity, WorkerEntity])],
  controllers: [CertificationController],
  providers: [CertificationService],
  exports: [CertificationService],
})
export class CertificationModule {}

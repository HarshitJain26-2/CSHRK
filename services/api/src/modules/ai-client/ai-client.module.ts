import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIInferenceLogEntity, AIModelVersionEntity } from '../../database/entities';
import { AIClientService } from './ai-client.service';
import { AIClientController } from './ai-client.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AIInferenceLogEntity, AIModelVersionEntity])],
  controllers: [AIClientController],
  providers: [AIClientService],
  exports: [AIClientService],
})
export class AIClientModule {}

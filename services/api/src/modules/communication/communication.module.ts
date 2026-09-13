import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversationEntity,
  MessageEntity,
  BookingEntity,
  WorkerEntity,
  CustomerEntity,
  CooperativeMembershipEntity,
} from '../../database/entities';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { CommunicationController } from './communication.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationEntity,
      MessageEntity,
      BookingEntity,
      WorkerEntity,
      CustomerEntity,
      CooperativeMembershipEntity,
    ]),
  ],
  controllers: [CommunicationController],
  providers: [ConversationService, MessageService],
  exports: [ConversationService, MessageService],
})
export class CommunicationModule {}

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { MessageStatus, IAttachmentMetadata } from '@cshrk/types';
import { CshrkBaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';
import { ConversationEntity } from './conversation.entity';

@Entity('messages')
@Index(['conversationId', 'createdAt'])
export class MessageEntity extends CshrkBaseEntity {
  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationEntity;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ name: 'client_message_id', type: 'varchar', length: 100, nullable: true })
  clientMessageId?: string;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date;

  @Column({ name: 'attachments_json', type: 'jsonb', nullable: true })
  attachmentsJson?: IAttachmentMetadata[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationType, MessageStatus } from '@cshrk/types';

export class CreateConversationDto {
  @ApiProperty({ enum: ConversationType, default: ConversationType.BOOKING })
  type: ConversationType;

  @ApiPropertyOptional({ description: 'Associated booking ID' })
  bookingId?: string;

  @ApiPropertyOptional({ description: 'Target worker ID' })
  workerId?: string;

  @ApiPropertyOptional({ description: 'Target customer ID' })
  customerId?: string;

  @ApiPropertyOptional({ description: 'Target cooperative ID' })
  cooperativeId?: string;

  @ApiPropertyOptional({ description: 'Conversation title' })
  title?: string;
}

export class AttachmentDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  filename: string;

  @ApiProperty({ enum: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] })
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

  @ApiProperty({ description: 'File size in bytes (max 5MB)' })
  fileSizeBytes: number;

  @ApiProperty()
  url: string;

  @ApiProperty({ description: 'SHA-256 hex checksum' })
  sha256Checksum: string;

  @ApiPropertyOptional()
  uploadedAt?: string;
}

export class SendMessageDto {
  @ApiProperty({ description: 'Message content (1-2000 chars)' })
  content: string;

  @ApiPropertyOptional({ description: 'Client-generated message ID for offline idempotency' })
  clientMessageId?: string;

  @ApiPropertyOptional({ type: [AttachmentDto], description: 'Optional verified attachments (max 5)' })
  attachments?: AttachmentDto[];
}

export class QueryMessagesDto {
  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  limit?: number;
}

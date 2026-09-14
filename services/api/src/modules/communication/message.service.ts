import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity, ConversationEntity } from '../../database/entities';
import { MessageStatus, UserRole, IAttachmentMetadata } from '@cshrk/types';
import { ConversationService } from './conversation.service';
import { SendMessageDto, QueryMessagesDto } from './dto/communication.dto';

interface RateLimitEntry {
  timestamps: number[];
}

@Injectable()
export class MessageService {
  // In-memory sliding window rate limiter: Key = `${userId}:${conversationId}` -> timestamps
  private readonly rateLimits = new Map<string, RateLimitEntry>();
  private readonly MAX_MESSAGES_PER_MINUTE = 15;
  private readonly WINDOW_MS = 60 * 1000;

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    private readonly conversationService: ConversationService,
  ) {}

  async sendMessage(
    userId: string,
    userRole: UserRole,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageEntity> {
    // 1. Check rate limits
    this.checkRateLimit(userId, conversationId);

    // 2. Authorize conversation participation
    const conversation = await this.conversationService.getConversationById(
      userId,
      userRole,
      conversationId,
    );

    // 3. Check for idempotency with clientMessageId (offline replay prevention)
    if (dto.clientMessageId) {
      const existing = await this.messageRepo.findOne({
        where: {
          conversationId,
          clientMessageId: dto.clientMessageId,
        },
        relations: ['sender'],
      });
      if (existing) {
        return existing;
      }
    }

    // 4. Sanitize content (strip potential script tags or malicious HTML)
    const sanitizedContent = this.sanitizeContent(dto.content);

    // 5. Validate attachments if present
    let validatedAttachments: IAttachmentMetadata[] | undefined = undefined;
    if (dto.attachments && dto.attachments.length > 0) {
      validatedAttachments = dto.attachments.map((att) => ({
        id: att.id || crypto.randomUUID(),
        filename: att.filename,
        mimeType: att.mimeType,
        fileSizeBytes: att.fileSizeBytes,
        url: att.url,
        sha256Checksum: att.sha256Checksum,
        uploadedAt: att.uploadedAt || new Date().toISOString(),
      }));
    }

    // 6. Create and persist message
    const message = this.messageRepo.create({
      conversationId,
      senderId: userId,
      content: sanitizedContent,
      status: MessageStatus.SENT,
      clientMessageId: dto.clientMessageId,
      attachmentsJson: validatedAttachments,
    });

    const savedMessage = await this.messageRepo.save(message);

    // 7. Update conversation lastMessageAt
    await this.conversationRepo.update(conversationId, {
      lastMessageAt: new Date(),
    });

    return this.messageRepo.findOneOrFail({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });
  }

  async listMessages(
    userId: string,
    userRole: UserRole,
    conversationId: string,
    query: QueryMessagesDto,
  ): Promise<{ messages: MessageEntity[]; total: number }> {
    // Verify access
    await this.conversationService.getConversationById(userId, userRole, conversationId);

    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: limit,
      skip,
    });

    return { messages, total };
  }

  async markMessageRead(
    userId: string,
    userRole: UserRole,
    conversationId: string,
    messageId: string,
  ): Promise<MessageEntity> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId, conversationId },
      relations: ['conversation'],
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    // Verify user can access conversation
    await this.conversationService.verifyConversationAccess(
      userId,
      userRole,
      message.conversation,
    );

    // Only update if not already READ and reader is not sender
    if (message.senderId !== userId && message.status !== MessageStatus.READ) {
      message.status = MessageStatus.READ;
      message.readAt = new Date();
      return this.messageRepo.save(message);
    }

    return message;
  }

  private checkRateLimit(userId: string, conversationId: string): void {
    const key = `${userId}:${conversationId}`;
    const now = Date.now();
    const entry = this.rateLimits.get(key) || { timestamps: [] };

    // Filter out timestamps outside window
    const recent = entry.timestamps.filter((ts) => now - ts < this.WINDOW_MS);

    if (recent.length >= this.MAX_MESSAGES_PER_MINUTE) {
      throw new HttpException(
        'Rate limit exceeded: Maximum 15 messages per minute. Please wait before sending another message.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recent.push(now);
    this.rateLimits.set(key, { timestamps: recent });
  }

  private sanitizeContent(content: string): string {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();
  }
}

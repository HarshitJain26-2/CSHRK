import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BookingEntity,
  MessageEntity,
  WorkerSupportRequestEntity,
} from '../../database/entities';
import {
  OfflineSyncOperationType,
  BookingStatus,
  UserRole,
  IOfflineSyncResponse,
  IOfflineSyncResult,
} from '@cshrk/types';
import { MessageService } from '../communication/message.service';
import { WelfareOperationsService } from '../welfare-operations/welfare-operations.service';
import { AuditService } from '../audit/audit.service';
import { OfflineSyncQueueDto, OfflineSyncItemDto } from './dto/resilience.dto';

@Injectable()
export class ResilienceService {
  private readonly logger = new Logger(ResilienceService.name);
  private readonly processedIdempotencyKeys = new Set<string>();

  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(WorkerSupportRequestEntity)
    private readonly supportRequestRepo: Repository<WorkerSupportRequestEntity>,
    private readonly messageService: MessageService,
    private readonly welfareService: WelfareOperationsService,
    private readonly auditService: AuditService,
  ) {}

  async processSyncBatch(
    userId: string,
    userRole: UserRole,
    dto: OfflineSyncQueueDto,
  ): Promise<IOfflineSyncResponse> {
    const results: IOfflineSyncResult[] = [];
    let appliedCount = 0;
    let conflictCount = 0;

    for (const item of dto.items) {
      try {
        const result = await this.processSingleItem(userId, userRole, item);
        results.push(result);
        if (result.status === 'APPLIED') {
          appliedCount++;
        } else if (result.status === 'CONFLICT_RESOLVED') {
          conflictCount++;
        }
      } catch (err: any) {
        results.push({
          operationId: item.operationId,
          status: 'REJECTED',
          message: err.message || 'Operation failed during offline sync processing',
          serverTimestamp: new Date().toISOString(),
        });
      }
    }

    return {
      totalProcessed: dto.items.length,
      appliedCount,
      conflictCount,
      results,
    };
  }

  private async processSingleItem(
    userId: string,
    userRole: UserRole,
    item: OfflineSyncItemDto,
  ): Promise<IOfflineSyncResult> {
    // 1. Check in-memory / duplicate idempotency
    if (this.processedIdempotencyKeys.has(item.idempotencyKey)) {
      return {
        operationId: item.operationId,
        status: 'DUPLICATE_IGNORED',
        message: 'Operation previously processed with this idempotency key',
        serverTimestamp: new Date().toISOString(),
      };
    }

    switch (item.operationType) {
      // --------------------------------------------------------------------------
      // 1. JOB_STATUS_UPDATE Conflict Rule:
      // Server state takes precedence if server is in a terminal or disputed state.
      // --------------------------------------------------------------------------
      case OfflineSyncOperationType.JOB_STATUS_UPDATE: {
        const { bookingId, targetStatus } = item.payload;
        const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });

        if (!booking) {
          return {
            operationId: item.operationId,
            status: 'REJECTED',
            message: `Booking ${bookingId} not found`,
            serverTimestamp: new Date().toISOString(),
          };
        }

        // Server authoritative precedence check
        const isServerTerminal =
          booking.status === BookingStatus.CANCELLED ||
          booking.status === BookingStatus.DISPUTED ||
          booking.status === BookingStatus.COMPLETED;

        if (isServerTerminal) {
          return {
            operationId: item.operationId,
            status: 'CONFLICT_RESOLVED',
            message: `Conflict resolved: Server state (${booking.status}) is authoritative; offline transition to ${targetStatus} superseded.`,
            serverEntityId: booking.id,
            serverTimestamp: new Date().toISOString(),
            conflictDetails: { serverStatus: booking.status, clientAttemptedStatus: targetStatus },
          };
        }

        // Apply valid transition
        booking.status = targetStatus;
        if (targetStatus === BookingStatus.IN_PROGRESS && !booking.startTime) {
          booking.startTime = new Date(item.clientTimestamp);
        } else if (targetStatus === BookingStatus.COMPLETED && !booking.endTime) {
          booking.endTime = new Date(item.clientTimestamp);
        }

        const saved = await this.bookingRepo.save(booking);
        this.processedIdempotencyKeys.add(item.idempotencyKey);

        await this.auditService.log({
          userId,
          action: 'OFFLINE_JOB_STATUS_APPLIED',
          entityType: 'Booking',
          entityId: saved.id,
          metadata: { clientTimestamp: item.clientTimestamp, status: targetStatus },
        });

        return {
          operationId: item.operationId,
          status: 'APPLIED',
          message: `Booking status transitioned to ${targetStatus} from offline queue`,
          serverEntityId: saved.id,
          serverTimestamp: new Date().toISOString(),
        };
      }

      // --------------------------------------------------------------------------
      // 2. SEND_MESSAGE Conflict Rule:
      // Append-only with clientMessageId idempotency. Replays never overwrite.
      // --------------------------------------------------------------------------
      case OfflineSyncOperationType.SEND_MESSAGE: {
        const { conversationId, content, attachments } = item.payload;

        const existing = await this.messageRepo.findOne({
          where: { clientMessageId: item.idempotencyKey },
        });

        if (existing) {
          return {
            operationId: item.operationId,
            status: 'DUPLICATE_IGNORED',
            message: 'Offline message already delivered and persisted on server',
            serverEntityId: existing.id,
            serverTimestamp: new Date().toISOString(),
          };
        }

        const message = await this.messageService.sendMessage(
          userId,
          userRole,
          conversationId,
          {
            content,
            clientMessageId: item.idempotencyKey,
            attachments,
          },
        );

        this.processedIdempotencyKeys.add(item.idempotencyKey);

        return {
          operationId: item.operationId,
          status: 'APPLIED',
          message: 'Offline message persisted to conversation stream',
          serverEntityId: message.id,
          serverTimestamp: new Date().toISOString(),
        };
      }

      // --------------------------------------------------------------------------
      // 3. OFFLINE_ACKNOWLEDGE Conflict Rule:
      // Idempotent acknowledgement receipt.
      // --------------------------------------------------------------------------
      case OfflineSyncOperationType.OFFLINE_ACKNOWLEDGE: {
        this.processedIdempotencyKeys.add(item.idempotencyKey);

        await this.auditService.log({
          userId,
          action: 'OFFLINE_ASSIGNMENT_ACKNOWLEDGED',
          entityType: 'Booking',
          entityId: item.payload.bookingId,
          metadata: { clientTimestamp: item.clientTimestamp, acknowledgedAt: new Date().toISOString() },
        });

        return {
          operationId: item.operationId,
          status: 'APPLIED',
          message: 'Offline assignment acknowledgement recorded',
          serverTimestamp: new Date().toISOString(),
        };
      }

      // --------------------------------------------------------------------------
      // 4. SUPPORT_REQUEST Conflict Rule:
      // Client-generated UUID idempotency check.
      // --------------------------------------------------------------------------
      case OfflineSyncOperationType.SUPPORT_REQUEST: {
        const existing = await this.supportRequestRepo.findOne({
          where: { subject: item.payload.subject, category: item.payload.category },
        });

        if (existing && this.processedIdempotencyKeys.has(item.idempotencyKey)) {
          return {
            operationId: item.operationId,
            status: 'DUPLICATE_IGNORED',
            message: 'Support request already created',
            serverEntityId: existing.id,
            serverTimestamp: new Date().toISOString(),
          };
        }

        const request = await this.welfareService.createSupportRequest(userId, {
          category: item.payload.category,
          subject: item.payload.subject,
          description: item.payload.description,
        });

        this.processedIdempotencyKeys.add(item.idempotencyKey);

        return {
          operationId: item.operationId,
          status: 'APPLIED',
          message: 'Offline worker support request successfully registered',
          serverEntityId: request.id,
          serverTimestamp: new Date().toISOString(),
        };
      }

      default:
        return {
          operationId: item.operationId,
          status: 'REJECTED',
          message: `Unsupported offline operation type: ${item.operationType}`,
          serverTimestamp: new Date().toISOString(),
        };
    }
  }
}

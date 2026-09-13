import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DisputeEntity,
  DisputeEvidenceEntity,
  BookingEntity,
  PaymentEntity,
  CustomerEntity,
  WorkerEntity,
  CooperativeMembershipEntity,
} from '../../database/entities';
import {
  DisputeStatus,
  DisputeResolution,
  BookingStatus,
  PaymentStatus,
  UserRole,
  NotificationEventType,
  NotificationPriority,
  IAttachmentMetadata,
} from '@cshrk/types';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import { PaymentService } from '../payment/services/payment.service';
import {
  CreateDisputeDto,
  UpdateDisputeStatusDto,
  AddDisputeEvidenceDto,
  ResolveDisputeDto,
} from './dto/trust-safety.dto';

@Injectable()
export class DisputeService {
  private readonly ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ]);

  private readonly BLOCKED_EXTENSIONS = new Set([
    '.exe', '.bat', '.cmd', '.sh', '.bin', '.js', '.ts', '.py', '.msi', '.vbs', '.scr',
  ]);

  constructor(
    @InjectRepository(DisputeEntity)
    private readonly disputeRepo: Repository<DisputeEntity>,
    @InjectRepository(DisputeEvidenceEntity)
    private readonly evidenceRepo: Repository<DisputeEvidenceEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepo: Repository<WorkerEntity>,
    @InjectRepository(CooperativeMembershipEntity)
    private readonly coopMembershipRepo: Repository<CooperativeMembershipEntity>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly paymentService: PaymentService,
  ) {}

  async createDispute(
    userId: string,
    userRole: UserRole,
    dto: CreateDisputeDto,
  ): Promise<DisputeEntity> {
    const booking = await this.bookingRepo.findOne({
      where: { id: dto.bookingId },
      relations: ['customer', 'worker'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${dto.bookingId} not found`);
    }

    // Verify booking can be disputed (CONFIRMED, IN_PROGRESS, or COMPLETED)
    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.SCHEDULED &&
      booking.status !== BookingStatus.IN_PROGRESS &&
      booking.status !== BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot dispute booking with status ${booking.status}. Booking must be confirmed, in progress, or completed.`,
      );
    }

    // Determine respondent
    let respondentId: string | undefined = undefined;
    if (userRole === UserRole.CUSTOMER) {
      const customer = await this.customerRepo.findOne({ where: { userId } });
      if (!customer || booking.customerId !== customer.id) {
        throw new ForbiddenException('Only the booking customer can initiate this customer dispute');
      }
      respondentId = booking.worker?.userId;
    } else if (userRole === UserRole.WORKER) {
      const worker = await this.workerRepo.findOne({ where: { userId } });
      if (!worker || booking.workerId !== worker.id) {
        throw new ForbiddenException('Only the assigned worker can initiate this worker dispute');
      }
      respondentId = booking.customer?.userId;
    }

    const dispute = this.disputeRepo.create({
      bookingId: booking.id,
      initiatorId: userId,
      respondentId,
      cooperativeId: booking.cooperativeId,
      status: DisputeStatus.OPEN,
      reason: dto.reason,
      disputedAmount: dto.disputedAmount,
    });

    const savedDispute = await this.disputeRepo.save(dispute);

    // Update booking state machine to DISPUTED
    booking.status = BookingStatus.DISPUTED;
    await this.bookingRepo.save(booking);

    // Save any initial evidence
    if (dto.evidences && dto.evidences.length > 0) {
      for (const ev of dto.evidences) {
        this.validateAttachment(ev.attachment);
        const evidenceEntity = this.evidenceRepo.create({
          disputeId: savedDispute.id,
          submittedById: userId,
          title: ev.title,
          description: ev.description,
          attachmentJson: {
            id: ev.attachment.id || crypto.randomUUID(),
            filename: ev.attachment.filename,
            mimeType: ev.attachment.mimeType,
            fileSizeBytes: ev.attachment.fileSizeBytes,
            url: ev.attachment.url,
            sha256Checksum: ev.attachment.sha256Checksum,
            uploadedAt: ev.attachment.uploadedAt || new Date().toISOString(),
          },
        });
        await this.evidenceRepo.save(evidenceEntity);
      }
    }

    // Audit log
    await this.auditService.log({
      userId,
      action: 'DISPUTE_OPENED',
      entityType: 'Dispute',
      entityId: savedDispute.id,
      metadata: { bookingId: booking.id, amount: dto.disputedAmount, reason: dto.reason },
    });

    // Notify respondent
    if (respondentId) {
      await this.notificationService.dispatchNotification({
        recipientId: respondentId,
        title: 'Formal Dispute Opened',
        message: `A dispute has been opened for booking #${booking.id.slice(0, 8)}. Reason: ${dto.reason.slice(0, 100)}...`,
        eventType: NotificationEventType.DISPUTE_OPENED,
        priority: NotificationPriority.HIGH,
      });
    }

    return this.getDisputeById(userId, userRole, savedDispute.id);
  }

  async addEvidence(
    userId: string,
    userRole: UserRole,
    disputeId: string,
    dto: AddDisputeEvidenceDto,
  ): Promise<DisputeEvidenceEntity> {
    const dispute = await this.disputeRepo.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute ${disputeId} not found`);
    }

    // Verify user is authorized party or admin
    this.verifyDisputeParticipation(userId, userRole, dispute);

    // Validate attachment
    this.validateAttachment(dto.attachment);

    const evidence = this.evidenceRepo.create({
      disputeId,
      submittedById: userId,
      title: dto.title,
      description: dto.description,
      attachmentJson: {
        id: dto.attachment.id || crypto.randomUUID(),
        filename: dto.attachment.filename,
        mimeType: dto.attachment.mimeType,
        fileSizeBytes: dto.attachment.fileSizeBytes,
        url: dto.attachment.url,
        sha256Checksum: dto.attachment.sha256Checksum,
        uploadedAt: dto.attachment.uploadedAt || new Date().toISOString(),
      },
    });

    const saved = await this.evidenceRepo.save(evidence);

    await this.auditService.log({
      userId,
      action: 'DISPUTE_EVIDENCE_SUBMITTED',
      entityType: 'DisputeEvidence',
      entityId: saved.id,
      metadata: { disputeId, title: dto.title, filename: dto.attachment.filename },
    });

    return saved;
  }

  async updateDisputeStatus(
    userId: string,
    userRole: UserRole,
    disputeId: string,
    dto: UpdateDisputeStatusDto,
  ): Promise<DisputeEntity> {
    const dispute = await this.disputeRepo.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute ${disputeId} not found`);
    }

    if (
      userRole !== UserRole.COOPERATIVE_ADMIN &&
      userRole !== UserRole.FEDERATION_ADMIN &&
      userRole !== UserRole.PLATFORM_ADMIN
    ) {
      throw new ForbiddenException('Only administrators can update dispute operational status');
    }

    const oldStatus = dispute.status;
    dispute.status = dto.status;
    if (dto.resolutionNotes) {
      dispute.resolutionNotes = dto.resolutionNotes;
    }

    const updated = await this.disputeRepo.save(dispute);

    await this.auditService.log({
      userId,
      action: 'DISPUTE_STATUS_UPDATED',
      entityType: 'Dispute',
      entityId: dispute.id,
      metadata: { oldStatus, newStatus: dto.status, notes: dto.resolutionNotes },
    });

    // Notify parties
    const notifyUsers = [dispute.initiatorId, dispute.respondentId].filter(Boolean) as string[];
    for (const recipientId of notifyUsers) {
      await this.notificationService.dispatchNotification({
        recipientId,
        title: `Dispute Status: ${dto.status}`,
        message: `Dispute #${dispute.id.slice(0, 8)} status changed to ${dto.status}.`,
        eventType: NotificationEventType.DISPUTE_UPDATED,
        priority: NotificationPriority.NORMAL,
      });
    }

    return updated;
  }

  async resolveDispute(
    userId: string,
    userRole: UserRole,
    disputeId: string,
    dto: ResolveDisputeDto,
  ): Promise<DisputeEntity> {
    const dispute = await this.disputeRepo.findOne({
      where: { id: disputeId },
      relations: ['booking'],
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute ${disputeId} not found`);
    }

    if (
      userRole !== UserRole.COOPERATIVE_ADMIN &&
      userRole !== UserRole.FEDERATION_ADMIN &&
      userRole !== UserRole.PLATFORM_ADMIN
    ) {
      throw new ForbiddenException('Only authorized administrators can arbitrate and resolve disputes');
    }

    // Controlled Payment Integration
    if (
      dto.resolution === DisputeResolution.FULL_REFUND_CUSTOMER ||
      dto.resolution === DisputeResolution.PARTIAL_SETTLEMENT
    ) {
      // Find associated payment for this booking
      const payment = await this.paymentRepo.findOne({
        where: { bookingId: dispute.bookingId, status: PaymentStatus.PAID },
      });

      if (payment) {
        const refundAmount =
          dto.resolution === DisputeResolution.FULL_REFUND_CUSTOMER
            ? Number(payment.amount)
            : Number(dto.refundAmount || dispute.disputedAmount);

        // Explicitly trigger controlled refund transition through PaymentService
        await this.paymentService.processRefund(
          payment.id,
          refundAmount,
          `Dispute #${dispute.id.slice(0, 8)} resolution: ${dto.resolutionNotes}`,
          userId,
        );
      }
    }

    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolution = dto.resolution;
    dispute.resolutionNotes = dto.resolutionNotes;
    dispute.resolvedById = userId;
    dispute.resolvedAt = new Date();

    const resolved = await this.disputeRepo.save(dispute);

    await this.auditService.log({
      userId,
      action: 'DISPUTE_RESOLVED',
      entityType: 'Dispute',
      entityId: dispute.id,
      metadata: {
        resolution: dto.resolution,
        resolutionNotes: dto.resolutionNotes,
        refundAmount: dto.refundAmount,
      },
    });

    // Notify both parties of binding decision
    const notifyUsers = [dispute.initiatorId, dispute.respondentId].filter(Boolean) as string[];
    for (const recipientId of notifyUsers) {
      await this.notificationService.dispatchNotification({
        recipientId,
        title: 'Dispute Decision Issued',
        message: `Dispute #${dispute.id.slice(0, 8)} has been arbitrated: ${dto.resolution}. Decision: ${dto.resolutionNotes.slice(0, 120)}...`,
        eventType: NotificationEventType.DISPUTE_UPDATED,
        priority: NotificationPriority.HIGH,
      });
    }

    return resolved;
  }

  async listDisputes(
    userId: string,
    userRole: UserRole,
  ): Promise<DisputeEntity[]> {
    const qb = this.disputeRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.booking', 'booking')
      .leftJoinAndSelect('d.initiator', 'initiator')
      .leftJoinAndSelect('d.respondent', 'respondent')
      .leftJoinAndSelect('d.cooperative', 'cooperative')
      .leftJoinAndSelect('d.evidences', 'evidences')
      .orderBy('d.createdAt', 'DESC');

    if (userRole === UserRole.CUSTOMER || userRole === UserRole.WORKER) {
      qb.andWhere('(d.initiatorId = :userId OR d.respondentId = :userId)', { userId });
    } else if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership) return [];
      qb.andWhere('d.cooperativeId = :coopId', { coopId: membership.cooperativeId });
    }

    return qb.getMany();
  }

  async getDisputeById(
    userId: string,
    userRole: UserRole,
    disputeId: string,
  ): Promise<DisputeEntity> {
    const dispute = await this.disputeRepo.findOne({
      where: { id: disputeId },
      relations: ['booking', 'initiator', 'respondent', 'cooperative', 'evidences', 'resolvedBy'],
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute ${disputeId} not found`);
    }

    return dispute;
  }

  private verifyDisputeParticipation(
    userId: string,
    userRole: UserRole,
    dispute: DisputeEntity,
  ): void {
    if (
      userRole === UserRole.PLATFORM_ADMIN ||
      userRole === UserRole.FEDERATION_ADMIN ||
      userRole === UserRole.COOPERATIVE_ADMIN
    ) {
      return;
    }

    if (dispute.initiatorId !== userId && dispute.respondentId !== userId) {
      throw new ForbiddenException('Not authorized for this dispute');
    }
  }

  private validateAttachment(attachment: any): void {
    if (!attachment || !attachment.filename) {
      throw new BadRequestException('Attachment filename is required');
    }

    if (!this.ALLOWED_MIME_TYPES.has(attachment.mimeType)) {
      throw new BadRequestException(
        `Invalid file type "${attachment.mimeType}". Only JPEG, PNG, WEBP, and PDF documents are permitted.`,
      );
    }

    const lowerFilename = attachment.filename.toLowerCase();
    for (const ext of this.BLOCKED_EXTENSIONS) {
      if (lowerFilename.endsWith(ext)) {
        throw new BadRequestException(
          `Security violation: Executable and script attachments (${ext}) are strictly prohibited.`,
        );
      }
    }

    if (attachment.fileSizeBytes > 5 * 1024 * 1024) {
      throw new BadRequestException('Attachment file size cannot exceed 5MB');
    }

    if (!attachment.sha256Checksum || attachment.sha256Checksum.length !== 64) {
      throw new BadRequestException('Valid 64-character SHA-256 checksum is required for evidence verification');
    }
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ComplaintEntity,
  BookingEntity,
  CustomerEntity,
  WorkerEntity,
  CooperativeMembershipEntity,
} from '../../database/entities';
import {
  ComplaintStatus,
  UserRole,
  NotificationEventType,
  NotificationPriority,
} from '@cshrk/types';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import {
  CreateComplaintDto,
  UpdateComplaintStatusDto,
} from './dto/trust-safety.dto';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(ComplaintEntity)
    private readonly complaintRepo: Repository<ComplaintEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepo: Repository<WorkerEntity>,
    @InjectRepository(CooperativeMembershipEntity)
    private readonly coopMembershipRepo: Repository<CooperativeMembershipEntity>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async createComplaint(
    userId: string,
    userRole: UserRole,
    dto: CreateComplaintDto,
  ): Promise<ComplaintEntity> {
    const booking = await this.bookingRepo.findOne({
      where: { id: dto.bookingId },
      relations: ['customer', 'worker'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${dto.bookingId} not found`);
    }

    // Verify user was a participant
    let customerId: string | undefined = undefined;
    let workerId: string | undefined = undefined;

    if (userRole === UserRole.CUSTOMER) {
      const customer = await this.customerRepo.findOne({ where: { userId } });
      if (!customer || booking.customerId !== customer.id) {
        throw new ForbiddenException('You can only file complaints for your own bookings');
      }
      customerId = customer.id;
      workerId = booking.workerId;
    } else if (userRole === UserRole.WORKER) {
      const worker = await this.workerRepo.findOne({ where: { userId } });
      if (!worker || booking.workerId !== worker.id) {
        throw new ForbiddenException('You can only file complaints for bookings assigned to you');
      }
      workerId = worker.id;
      customerId = booking.customerId;
    }

    const complaint = this.complaintRepo.create({
      bookingId: booking.id,
      raisedById: userId,
      customerId,
      workerId,
      cooperativeId: booking.cooperativeId,
      category: dto.category,
      description: dto.description,
      status: ComplaintStatus.OPEN,
    });

    const saved = await this.complaintRepo.save(complaint);

    // Audit log
    await this.auditService.log({
      userId,
      action: 'COMPLAINT_CREATED',
      entityType: 'Complaint',
      entityId: saved.id,
      metadata: { bookingId: booking.id, category: dto.category },
    });

    // Notify respondent user if applicable
    const respondentUserId = userRole === UserRole.CUSTOMER ? booking.worker?.userId : booking.customer?.userId;
    if (respondentUserId) {
      await this.notificationService.dispatchNotification({
        recipientId: respondentUserId,
        title: 'New Grievance Lodged',
        message: `A grievance has been raised regarding booking #${booking.id.slice(0, 8)}. Category: ${dto.category}.`,
        eventType: NotificationEventType.ADMIN_ACTION,
        priority: NotificationPriority.NORMAL,
      });
    }

    return saved;
  }

  async updateComplaintStatus(
    userId: string,
    userRole: UserRole,
    complaintId: string,
    dto: UpdateComplaintStatusDto,
  ): Promise<ComplaintEntity> {
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
      relations: ['booking'],
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint ${complaintId} not found`);
    }

    // Role check: Only Cooperative Admin, Federation Admin, or Platform Admin can advance complaint status
    if (
      userRole !== UserRole.COOPERATIVE_ADMIN &&
      userRole !== UserRole.FEDERATION_ADMIN &&
      userRole !== UserRole.PLATFORM_ADMIN
    ) {
      throw new ForbiddenException('Only administrators can review and resolve complaints');
    }

    if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership || complaint.cooperativeId !== membership.cooperativeId) {
        throw new ForbiddenException('Cannot manage complaints outside your cooperative');
      }
    }

    const oldStatus = complaint.status;
    complaint.status = dto.status;

    if (dto.resolutionNotes) {
      complaint.resolutionNotes = dto.resolutionNotes;
    }

    if (
      dto.status === ComplaintStatus.RESOLVED ||
      dto.status === ComplaintStatus.REJECTED ||
      dto.status === ComplaintStatus.CLOSED
    ) {
      complaint.resolvedById = userId;
      complaint.resolvedAt = new Date();
    }

    const updated = await this.complaintRepo.save(complaint);

    // Audit log
    await this.auditService.log({
      userId,
      action: 'COMPLAINT_STATUS_UPDATED',
      entityType: 'Complaint',
      entityId: complaint.id,
      metadata: { oldStatus, newStatus: dto.status, resolutionNotes: dto.resolutionNotes },
    });

    // Notify complainant
    await this.notificationService.dispatchNotification({
      recipientId: complaint.raisedById,
      title: `Complaint Status: ${dto.status}`,
      message: `Your complaint #${complaint.id.slice(0, 8)} status is now ${dto.status}.`,
      eventType: NotificationEventType.ADMIN_ACTION,
      priority: NotificationPriority.NORMAL,
    });

    return updated;
  }

  async listComplaints(
    userId: string,
    userRole: UserRole,
  ): Promise<ComplaintEntity[]> {
    const qb = this.complaintRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.booking', 'booking')
      .leftJoinAndSelect('c.raisedBy', 'raisedBy')
      .leftJoinAndSelect('c.cooperative', 'cooperative')
      .orderBy('c.createdAt', 'DESC');

    if (userRole === UserRole.CUSTOMER) {
      const customer = await this.customerRepo.findOne({ where: { userId } });
      if (!customer) return [];
      qb.andWhere('(c.raisedById = :userId OR c.customerId = :customerId)', {
        userId,
        customerId: customer.id,
      });
    } else if (userRole === UserRole.WORKER) {
      const worker = await this.workerRepo.findOne({ where: { userId } });
      if (!worker) return [];
      qb.andWhere('(c.raisedById = :userId OR c.workerId = :workerId)', {
        userId,
        workerId: worker.id,
      });
    } else if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership) return [];
      qb.andWhere('c.cooperativeId = :coopId', { coopId: membership.cooperativeId });
    }

    return qb.getMany();
  }

  async getComplaintById(
    userId: string,
    userRole: UserRole,
    complaintId: string,
  ): Promise<ComplaintEntity> {
    const complaint = await this.complaintRepo.findOne({
      where: { id: complaintId },
      relations: ['booking', 'raisedBy', 'cooperative', 'resolvedBy'],
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint ${complaintId} not found`);
    }

    return complaint;
  }
}

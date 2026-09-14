import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkerSupportRequestEntity,
  WelfareRecordEntity,
  WorkerEntity,
  CooperativeMembershipEntity,
} from '../../database/entities';
import {
  SupportRequestStatus,
  UserRole,
  NotificationEventType,
  NotificationPriority,
} from '@cshrk/types';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import {
  CreateWorkerSupportRequestDto,
  UpdateWorkerSupportRequestDto,
} from './dto/welfare.dto';

@Injectable()
export class WelfareOperationsService {
  constructor(
    @InjectRepository(WorkerSupportRequestEntity)
    private readonly requestRepo: Repository<WorkerSupportRequestEntity>,
    @InjectRepository(WelfareRecordEntity)
    private readonly welfareRecordRepo: Repository<WelfareRecordEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepo: Repository<WorkerEntity>,
    @InjectRepository(CooperativeMembershipEntity)
    private readonly coopMembershipRepo: Repository<CooperativeMembershipEntity>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async createSupportRequest(
    userId: string,
    dto: CreateWorkerSupportRequestDto,
  ): Promise<WorkerSupportRequestEntity> {
    const worker = await this.workerRepo.findOne({ where: { userId } });
    if (!worker) {
      throw new NotFoundException('Worker profile not found for current user');
    }

    const request = this.requestRepo.create({
      workerId: worker.id,
      cooperativeId: worker.cooperativeId,
      category: dto.category,
      subject: dto.subject,
      description: dto.description,
      status: SupportRequestStatus.SUBMITTED,
    });

    const saved = await this.requestRepo.save(request);

    // Audit log
    await this.auditService.log({
      userId,
      action: 'WORKER_SUPPORT_REQUEST_SUBMITTED',
      entityType: 'WorkerSupportRequest',
      entityId: saved.id,
      metadata: { category: dto.category, subject: dto.subject, cooperativeId: worker.cooperativeId },
    });

    // Notify cooperative admins
    const admins = await this.coopMembershipRepo.find({
      where: { cooperativeId: worker.cooperativeId, role: 'COOPERATIVE_ADMIN' },
    });
    for (const admin of admins) {
      await this.notificationService.dispatchNotification({
        recipientId: admin.userId,
        title: `Worker Support Request: ${dto.category}`,
        message: `${worker.fullName} submitted a support request: "${dto.subject}"`,
        eventType: NotificationEventType.SUPPORT_REQUEST_UPDATED,
        priority: NotificationPriority.HIGH,
      });
    }

    return saved;
  }

  async updateSupportRequestStatus(
    userId: string,
    userRole: UserRole,
    requestId: string,
    dto: UpdateWorkerSupportRequestDto,
  ): Promise<WorkerSupportRequestEntity> {
    const request = await this.requestRepo.findOne({
      where: { id: requestId },
      relations: ['worker'],
    });

    if (!request) {
      throw new NotFoundException(`Support Request ${requestId} not found`);
    }

    if (
      userRole !== UserRole.COOPERATIVE_ADMIN &&
      userRole !== UserRole.FEDERATION_ADMIN &&
      userRole !== UserRole.PLATFORM_ADMIN
    ) {
      throw new ForbiddenException('Only cooperative administrators can update support request lifecycle');
    }

    if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership || request.cooperativeId !== membership.cooperativeId) {
        throw new ForbiddenException('Cannot manage support requests outside your cooperative society');
      }
    }

    const oldStatus = request.status;
    request.status = dto.status;
    if (dto.actionTaken) {
      request.actionTaken = dto.actionTaken;
    }

    if (dto.status === SupportRequestStatus.RESOLVED || dto.status === SupportRequestStatus.CLOSED) {
      request.reviewedById = userId;
      request.resolvedAt = new Date();
    }

    const updated = await this.requestRepo.save(request);

    // Audit log
    await this.auditService.log({
      userId,
      action: 'WORKER_SUPPORT_REQUEST_UPDATED',
      entityType: 'WorkerSupportRequest',
      entityId: request.id,
      metadata: { oldStatus, newStatus: dto.status, actionTaken: dto.actionTaken },
    });

    // Notify worker
    if (request.worker?.userId) {
      await this.notificationService.dispatchNotification({
        recipientId: request.worker.userId,
        title: `Support Request Status: ${dto.status}`,
        message: `Your support request "${request.subject}" status is now ${dto.status}. Action: ${dto.actionTaken || 'Reviewed'}`,
        eventType: NotificationEventType.SUPPORT_REQUEST_UPDATED,
        priority: NotificationPriority.NORMAL,
      });
    }

    return updated;
  }

  async listSupportRequests(
    userId: string,
    userRole: UserRole,
  ): Promise<WorkerSupportRequestEntity[]> {
    const qb = this.requestRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.worker', 'worker')
      .leftJoinAndSelect('req.cooperative', 'cooperative')
      .leftJoinAndSelect('req.reviewedBy', 'reviewedBy')
      .orderBy('req.createdAt', 'DESC');

    if (userRole === UserRole.WORKER) {
      const worker = await this.workerRepo.findOne({ where: { userId } });
      if (!worker) return [];
      qb.andWhere('req.workerId = :workerId', { workerId: worker.id });
    } else if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership) return [];
      qb.andWhere('req.cooperativeId = :coopId', { coopId: membership.cooperativeId });
    }

    return qb.getMany();
  }

  async listWelfareRecords(
    userId: string,
    userRole: UserRole,
  ): Promise<WelfareRecordEntity[]> {
    const qb = this.welfareRecordRepo
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.worker', 'worker')
      .leftJoinAndSelect('w.cooperative', 'cooperative')
      .orderBy('w.createdAt', 'DESC');

    if (userRole === UserRole.WORKER) {
      const worker = await this.workerRepo.findOne({ where: { userId } });
      if (!worker) return [];
      qb.andWhere('w.workerId = :workerId', { workerId: worker.id });
    } else if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership) return [];
      qb.andWhere('w.cooperativeId = :coopId', { coopId: membership.cooperativeId });
    }

    return qb.getMany();
  }
}

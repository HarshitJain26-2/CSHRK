import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SosAlertEntity,
  SosUpdateEntity,
  BookingEntity,
  WorkerEntity,
  CustomerEntity,
  CooperativeMembershipEntity,
} from '../../database/entities';
import {
  SosStatus,
  UserRole,
  NotificationEventType,
  NotificationPriority,
} from '@cshrk/types';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import {
  CreateSosAlertDto,
  UpdateSosStatusDto,
  AssignSosResponderDto,
} from './dto/sos.dto';

@Injectable()
export class SosService {
  public static readonly STATUTORY_DISCLAIMER =
    'NOTICE: CSHRK Emergency SOS is an internal cooperative operations escalation mechanism for operational dispatch and safety coordination. It is NOT an authorized replacement for national emergency services (112, Police, or Ambulance). In life-threatening emergencies, call national emergency services immediately.';

  constructor(
    @InjectRepository(SosAlertEntity)
    private readonly sosAlertRepo: Repository<SosAlertEntity>,
    @InjectRepository(SosUpdateEntity)
    private readonly sosUpdateRepo: Repository<SosUpdateEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepo: Repository<WorkerEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(CooperativeMembershipEntity)
    private readonly coopMembershipRepo: Repository<CooperativeMembershipEntity>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async triggerSosAlert(
    userId: string,
    userRole: UserRole,
    dto: CreateSosAlertDto,
  ): Promise<SosAlertEntity> {
    let cooperativeId: string | undefined = undefined;

    // Look up associated booking or cooperative
    if (dto.bookingId) {
      const booking = await this.bookingRepo.findOne({ where: { id: dto.bookingId } });
      if (booking) {
        cooperativeId = booking.cooperativeId;
      }
    }

    if (!cooperativeId && userRole === UserRole.WORKER) {
      const worker = await this.workerRepo.findOne({ where: { userId } });
      if (worker) {
        cooperativeId = worker.cooperativeId;
      }
    }

    // Create GeoPoint geometry: [longitude, latitude]
    const geoPoint = {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    };

    const alert = this.sosAlertRepo.create({
      requesterId: userId,
      bookingId: dto.bookingId,
      cooperativeId,
      category: dto.category,
      priority: dto.priority,
      status: SosStatus.TRIGGERED,
      location: geoPoint,
      addressText: dto.addressText,
      description: dto.description,
      isLocationRedacted: false,
    });

    const saved = await this.sosAlertRepo.save(alert);

    // Initial timeline entry
    const initialUpdate = this.sosUpdateRepo.create({
      sosAlertId: saved.id,
      authorId: userId,
      note: `SOS Emergency Alert triggered by user. Priority: ${dto.priority}. Category: ${dto.category}.`,
      newStatus: SosStatus.TRIGGERED,
      location: geoPoint,
    });
    await this.sosUpdateRepo.save(initialUpdate);

    // Audit log
    await this.auditService.log({
      userId,
      action: 'SOS_TRIGGERED',
      entityType: 'SosAlert',
      entityId: saved.id,
      metadata: {
        category: dto.category,
        priority: dto.priority,
        bookingId: dto.bookingId,
        cooperativeId,
      },
    });

    // High-priority notification to cooperative administrators
    if (cooperativeId) {
      const adminMemberships = await this.coopMembershipRepo.find({
        where: { cooperativeId, role: 'COOPERATIVE_ADMIN' },
      });
      for (const m of adminMemberships) {
        await this.notificationService.dispatchNotification({
          recipientId: m.userId,
          title: `EMERGENCY ALERT: ${dto.category}`,
          message: `Worker/Customer SOS alert triggered! Location: ${dto.addressText || 'Coordinates attached'}. Priority: ${dto.priority}.`,
          eventType: NotificationEventType.SOS_ALERT_TRIGGERED,
          priority: NotificationPriority.URGENT,
        });
      }
    }

    return this.getSosAlertById(userId, userRole, saved.id);
  }

  async getSosAlertById(
    userId: string,
    userRole: UserRole,
    alertId: string,
  ): Promise<SosAlertEntity & { disclaimer: string }> {
    const alert = await this.sosAlertRepo.findOne({
      where: { id: alertId },
      relations: ['requester', 'booking', 'cooperative', 'assignedResponder', 'updates'],
    });

    if (!alert) {
      throw new NotFoundException(`SOS Alert ${alertId} not found`);
    }

    // Enforce Access Policy
    this.verifySosAccess(userId, userRole, alert);

    // Audit location access
    await this.auditService.log({
      userId,
      action: 'SOS_LOCATION_VIEWED',
      entityType: 'SosAlert',
      entityId: alert.id,
      metadata: { userRole, timestamp: new Date().toISOString() },
    });

    // Enforce Location Retention & Redaction Policy:
    // If alert has been resolved for more than 30 days, truncate GPS precision
    const isOldResolved =
      alert.resolvedAt &&
      Date.now() - new Date(alert.resolvedAt).getTime() > 30 * 24 * 60 * 60 * 1000;

    if (alert.isLocationRedacted || isOldResolved) {
      if (alert.location && alert.location.coordinates) {
        // Redact to 2 decimal places (district level)
        alert.location = {
          type: 'Point',
          coordinates: [
            Math.round(alert.location.coordinates[0] * 100) / 100,
            Math.round(alert.location.coordinates[1] * 100) / 100,
          ],
        };
        alert.isLocationRedacted = true;
      }
    }

    return Object.assign(alert, { disclaimer: SosService.STATUTORY_DISCLAIMER });
  }

  async assignResponder(
    userId: string,
    userRole: UserRole,
    alertId: string,
    dto: AssignSosResponderDto,
  ): Promise<SosAlertEntity> {
    const alert = await this.sosAlertRepo.findOne({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException(`SOS Alert ${alertId} not found`);
    }

    if (
      userRole !== UserRole.COOPERATIVE_ADMIN &&
      userRole !== UserRole.FEDERATION_ADMIN &&
      userRole !== UserRole.PLATFORM_ADMIN
    ) {
      throw new ForbiddenException('Only operational administrators can assign SOS responders');
    }

    alert.assignedResponderId = dto.responderId;
    alert.status = SosStatus.RESPONDER_ASSIGNED;
    const saved = await this.sosAlertRepo.save(alert);

    // Record timeline update
    const update = this.sosUpdateRepo.create({
      sosAlertId: alert.id,
      authorId: userId,
      note: `Operational responder assigned: ${dto.responderId}`,
      previousStatus: alert.status,
      newStatus: SosStatus.RESPONDER_ASSIGNED,
    });
    await this.sosUpdateRepo.save(update);

    // Audit log
    await this.auditService.log({
      userId,
      action: 'SOS_RESPONDER_ASSIGNED',
      entityType: 'SosAlert',
      entityId: alert.id,
      metadata: { responderId: dto.responderId },
    });

    // Notify responder
    await this.notificationService.dispatchNotification({
      recipientId: dto.responderId,
      title: 'CRITICAL: Assigned as SOS Responder',
      message: `You have been dispatched to SOS Emergency #${alert.id.slice(0, 8)}. Category: ${alert.category}.`,
      eventType: NotificationEventType.SOS_ALERT_TRIGGERED,
      priority: NotificationPriority.URGENT,
    });

    return this.getSosAlertById(userId, userRole, saved.id);
  }

  async updateSosStatus(
    userId: string,
    userRole: UserRole,
    alertId: string,
    dto: UpdateSosStatusDto,
  ): Promise<SosAlertEntity> {
    const alert = await this.sosAlertRepo.findOne({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException(`SOS Alert ${alertId} not found`);
    }

    if (
      userRole !== UserRole.COOPERATIVE_ADMIN &&
      userRole !== UserRole.FEDERATION_ADMIN &&
      userRole !== UserRole.PLATFORM_ADMIN &&
      alert.assignedResponderId !== userId
    ) {
      throw new ForbiddenException('Only assigned responders or administrators can update SOS status');
    }

    const previousStatus = alert.status;
    alert.status = dto.status;

    if (dto.resolutionNotes) {
      alert.resolutionNotes = dto.resolutionNotes;
    }

    if (dto.status === SosStatus.RESOLVED || dto.status === SosStatus.FALSE_ALARM) {
      alert.resolvedAt = new Date();
    }

    const saved = await this.sosAlertRepo.save(alert);

    // Record update
    const update = this.sosUpdateRepo.create({
      sosAlertId: alert.id,
      authorId: userId,
      note: dto.note || `Status transitioned to ${dto.status}. Notes: ${dto.resolutionNotes || 'None'}`,
      previousStatus,
      newStatus: dto.status,
    });
    await this.sosUpdateRepo.save(update);

    // Audit
    await this.auditService.log({
      userId,
      action: 'SOS_STATUS_UPDATED',
      entityType: 'SosAlert',
      entityId: alert.id,
      metadata: { previousStatus, newStatus: dto.status, resolutionNotes: dto.resolutionNotes },
    });

    // Notify requester
    await this.notificationService.dispatchNotification({
      recipientId: alert.requesterId,
      title: `Emergency Status: ${dto.status}`,
      message: `Your SOS alert #${alert.id.slice(0, 8)} status is now ${dto.status}.`,
      eventType: NotificationEventType.SOS_ALERT_TRIGGERED,
      priority: NotificationPriority.HIGH,
    });

    return this.getSosAlertById(userId, userRole, saved.id);
  }

  async listAlerts(
    userId: string,
    userRole: UserRole,
  ): Promise<SosAlertEntity[]> {
    const qb = this.sosAlertRepo
      .createQueryBuilder('sos')
      .leftJoinAndSelect('sos.requester', 'requester')
      .leftJoinAndSelect('sos.booking', 'booking')
      .leftJoinAndSelect('sos.cooperative', 'cooperative')
      .leftJoinAndSelect('sos.assignedResponder', 'assignedResponder')
      .leftJoinAndSelect('sos.updates', 'updates')
      .orderBy('sos.createdAt', 'DESC');

    if (userRole === UserRole.CUSTOMER || userRole === UserRole.WORKER) {
      qb.andWhere('(sos.requesterId = :userId OR sos.assignedResponderId = :userId)', { userId });
    } else if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership) return [];
      qb.andWhere('sos.cooperativeId = :coopId', { coopId: membership.cooperativeId });
    }

    return qb.getMany();
  }

  private verifySosAccess(
    userId: string,
    userRole: UserRole,
    alert: SosAlertEntity,
  ): void {
    if (
      userRole === UserRole.PLATFORM_ADMIN ||
      userRole === UserRole.FEDERATION_ADMIN
    ) {
      return;
    }

    if (alert.requesterId === userId || alert.assignedResponderId === userId) {
      return;
    }

    if (userRole === UserRole.COOPERATIVE_ADMIN && alert.cooperativeId) {
      return; // Permitted for cooperative dispatcher
    }

    throw new ForbiddenException('Access denied: Unauthorized to view this emergency alert and location data');
  }
}

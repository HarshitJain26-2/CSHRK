import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AccountRestrictionEntity,
  UserEntity,
} from '../../database/entities';
import {
  AccountRestrictionType,
  AccountStatus,
  UserRole,
  NotificationEventType,
  NotificationPriority,
} from '@cshrk/types';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import {
  CreateAccountRestrictionDto,
  RevokeAccountRestrictionDto,
} from './dto/trust-safety.dto';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(AccountRestrictionEntity)
    private readonly restrictionRepo: Repository<AccountRestrictionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async restrictAccount(
    adminUserId: string,
    adminRole: UserRole,
    dto: CreateAccountRestrictionDto,
  ): Promise<AccountRestrictionEntity> {
    if (adminRole !== UserRole.PLATFORM_ADMIN && adminRole !== UserRole.FEDERATION_ADMIN) {
      throw new ForbiddenException('Only platform and federation administrators can impose account restrictions');
    }

    const targetUser = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!targetUser) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    // Do not allow restricting other platform admins
    if (targetUser.role === UserRole.PLATFORM_ADMIN) {
      throw new BadRequestException('Platform administrators cannot be restricted');
    }

    const restriction = this.restrictionRepo.create({
      userId: dto.userId,
      restrictionType: dto.restrictionType,
      reason: dto.reason,
      issuedById: adminUserId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      isActive: true,
    });

    const saved = await this.restrictionRepo.save(restriction);

    // Update target user status while preserving all relational records
    if (
      dto.restrictionType === AccountRestrictionType.SUSPENDED ||
      dto.restrictionType === AccountRestrictionType.DEACTIVATED
    ) {
      targetUser.status = AccountStatus.SUSPENDED;
      await this.userRepo.save(targetUser);
    }

    await this.auditService.log({
      userId: adminUserId,
      action: 'ACCOUNT_RESTRICTION_IMPOSED',
      entityType: 'AccountRestriction',
      entityId: saved.id,
      metadata: { targetUserId: dto.userId, restrictionType: dto.restrictionType, reason: dto.reason },
    });

    // Send high-priority notification to affected user
    await this.notificationService.dispatchNotification({
      recipientId: dto.userId,
      title: `Account Action: ${dto.restrictionType}`,
      message: `Your account has been placed under ${dto.restrictionType}. Reason: ${dto.reason}`,
      eventType: NotificationEventType.ADMIN_ACTION,
      priority: NotificationPriority.HIGH,
    });

    return saved;
  }

  async revokeRestriction(
    adminUserId: string,
    adminRole: UserRole,
    restrictionId: string,
    dto: RevokeAccountRestrictionDto,
  ): Promise<AccountRestrictionEntity> {
    if (adminRole !== UserRole.PLATFORM_ADMIN && adminRole !== UserRole.FEDERATION_ADMIN) {
      throw new ForbiddenException('Only platform and federation administrators can revoke restrictions');
    }

    const restriction = await this.restrictionRepo.findOne({
      where: { id: restrictionId },
      relations: ['user'],
    });

    if (!restriction) {
      throw new NotFoundException(`Restriction ${restrictionId} not found`);
    }

    restriction.isActive = false;
    restriction.revokedAt = new Date();
    restriction.revocationReason = dto.revocationReason;

    const saved = await this.restrictionRepo.save(restriction);

    // Check if user has other active suspensions
    const otherActive = await this.restrictionRepo.count({
      where: {
        userId: restriction.userId,
        isActive: true,
        restrictionType: AccountRestrictionType.SUSPENDED,
      },
    });

    if (otherActive === 0 && restriction.user) {
      restriction.user.status = AccountStatus.ACTIVE;
      await this.userRepo.save(restriction.user);
    }

    await this.auditService.log({
      userId: adminUserId,
      action: 'ACCOUNT_RESTRICTION_REVOKED',
      entityType: 'AccountRestriction',
      entityId: restriction.id,
      metadata: { targetUserId: restriction.userId, reason: dto.revocationReason },
    });

    await this.notificationService.dispatchNotification({
      recipientId: restriction.userId,
      title: 'Account Restriction Revoked',
      message: `Your account restriction has been lifted: ${dto.revocationReason}. Account status restored.`,
      eventType: NotificationEventType.ADMIN_ACTION,
      priority: NotificationPriority.NORMAL,
    });

    return saved;
  }

  async listRestrictions(): Promise<AccountRestrictionEntity[]> {
    return this.restrictionRepo.find({
      relations: ['user', 'issuedBy'],
      order: { createdAt: 'DESC' },
    });
  }
}

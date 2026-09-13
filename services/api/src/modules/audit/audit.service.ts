import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  /**
   * Append-only audit logging method.
   * Records governance actions without any ability to update or delete.
   */
  async logAction(
    userId: string | undefined,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
  ): Promise<AuditLogEntity> {
    const entry = this.auditRepo.create({
      userId,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress,
    });
    return this.auditRepo.save(entry);
  }

  /**
   * Read-only query for audit log trail.
   */
  async findLogs(query: {
    entityType?: string;
    entityId?: string;
    action?: string;
    userId?: string;
    limit?: number;
    page?: number;
  }): Promise<{ items: AuditLogEntity[]; total: number }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const qb = this.auditRepo.createQueryBuilder('log');

    if (query.entityType) {
      qb.andWhere('log.entityType = :entityType', { entityType: query.entityType });
    }
    if (query.entityId) {
      qb.andWhere('log.entityId = :entityId', { entityId: query.entityId });
    }
    if (query.action) {
      qb.andWhere('LOWER(log.action) LIKE :action', {
        action: `%${query.action.toLowerCase()}%`,
      });
    }
    if (query.userId) {
      qb.andWhere('log.userId = :userId', { userId: query.userId });
    }

    qb.orderBy('log.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}

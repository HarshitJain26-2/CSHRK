import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CooperativeMembershipEntity } from '../../database/entities/cooperative-membership.entity';
import { FederationMembershipEntity } from '../../database/entities/federation-membership.entity';
import { BookingEntity } from '../../database/entities/booking.entity';
import { SkillEntity } from '../../database/entities/skill.entity';
import { WorkerSkillEntity } from '../../database/entities/worker-skill.entity';
import { WelfareRecordEntity } from '../../database/entities/welfare-record.entity';
import { AuditService } from '../audit/audit.service';
import {
  CreateCooperativeDto,
  UpdateCooperativeDto,
  UpdateAffiliationDto,
} from './dto/cooperative.dto';
import {
  UserRole,
  AccountStatus,
  MembershipStatus,
  BookingStatus,
  IWorkforceCapacity,
} from '@cshrk/types';

@Injectable()
export class CooperativeService {
  constructor(
    @InjectRepository(CooperativeEntity)
    private readonly coopRepository: Repository<CooperativeEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepository: Repository<WorkerEntity>,
    @InjectRepository(CooperativeMembershipEntity)
    private readonly coopMembershipRepo: Repository<CooperativeMembershipEntity>,
    @InjectRepository(FederationMembershipEntity)
    private readonly fedMembershipRepo: Repository<FederationMembershipEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillRepo: Repository<SkillEntity>,
    @InjectRepository(WorkerSkillEntity)
    private readonly workerSkillRepo: Repository<WorkerSkillEntity>,
    @InjectRepository(WelfareRecordEntity)
    private readonly welfareRepo: Repository<WelfareRecordEntity>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Enforces server-side tenant scope isolation:
   * - PLATFORM_ADMIN: global access
   * - COOPERATIVE_ADMIN: only their own cooperative
   * - FEDERATION_ADMIN: only cooperatives belonging to their federation
   */
  async validateCooperativeAccess(
    user: { id: string; role: UserRole },
    targetCooperativeId: string,
  ): Promise<CooperativeEntity> {
    const coop = await this.getCooperativeById(targetCooperativeId);

    if (user.role === UserRole.PLATFORM_ADMIN) {
      return coop;
    }

    if (user.role === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({
        where: {
          userId: user.id,
          cooperativeId: targetCooperativeId,
          status: MembershipStatus.ACTIVE,
        },
      });
      if (!membership) {
        throw new ForbiddenException(
          'Access denied: You are not an active administrator of this cooperative society',
        );
      }
      return coop;
    }

    if (user.role === UserRole.FEDERATION_ADMIN) {
      const fedMembership = await this.fedMembershipRepo.findOne({
        where: {
          userId: user.id,
          federationId: coop.federationId,
          status: MembershipStatus.ACTIVE,
        },
      });
      if (!fedMembership) {
        throw new ForbiddenException(
          'Access denied: Cooperative does not belong to your federation network',
        );
      }
      return coop;
    }

    return coop;
  }

  async getMyCooperative(user: { id: string; role: UserRole }): Promise<CooperativeEntity> {
    const membership = await this.coopMembershipRepo.findOne({
      where: { userId: user.id, status: MembershipStatus.ACTIVE },
      relations: ['cooperative'],
    });

    if (!membership || !membership.cooperative) {
      throw new NotFoundException('No active cooperative society associated with your account');
    }

    return membership.cooperative;
  }

  async createCooperative(dto: CreateCooperativeDto): Promise<CooperativeEntity> {
    const existing = await this.coopRepository.findOne({
      where: { registrationNumber: dto.registrationNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Cooperative with registration number ${dto.registrationNumber} already exists`,
      );
    }

    const coop = this.coopRepository.create(dto);
    const saved = await this.coopRepository.save(coop);

    await this.auditService.logAction(
      undefined,
      'CREATE_COOPERATIVE',
      'COOPERATIVE',
      saved.id,
      { name: saved.name, registrationNumber: saved.registrationNumber },
    );

    return saved;
  }

  async listCooperatives(district?: string, search?: string): Promise<CooperativeEntity[]> {
    const qb = this.coopRepository.createQueryBuilder('coop');
    if (district) {
      qb.andWhere('coop.district = :district', { district });
    }
    if (search) {
      qb.andWhere(
        '(LOWER(coop.name) LIKE :s OR LOWER(coop.registrationNumber) LIKE :s OR LOWER(coop.district) LIKE :s)',
        { s: `%${search.toLowerCase()}%` },
      );
    }
    return qb.orderBy('coop.name', 'ASC').getMany();
  }

  async getCooperativeById(id: string): Promise<CooperativeEntity> {
    const coop = await this.coopRepository.findOne({ where: { id } });
    if (!coop) {
      throw new NotFoundException(`Cooperative with ID ${id} not found`);
    }
    return coop;
  }

  async updateCooperative(id: string, dto: UpdateCooperativeDto): Promise<CooperativeEntity> {
    const coop = await this.getCooperativeById(id);
    if (dto.name) coop.name = dto.name;
    if (dto.district) coop.district = dto.district;
    if (dto.contactEmail) coop.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) coop.contactPhone = dto.contactPhone;
    if (dto.status) coop.status = dto.status;
    const saved = await this.coopRepository.save(coop);

    await this.auditService.logAction(
      undefined,
      'UPDATE_COOPERATIVE',
      'COOPERATIVE',
      saved.id,
      dto,
    );

    return saved;
  }

  async getCooperativeMembers(id: string): Promise<WorkerEntity[]> {
    await this.getCooperativeById(id);
    return this.workerRepository.find({
      where: { cooperativeId: id },
      relations: ['user', 'workerSkills', 'workerSkills.skill'],
      order: { fullName: 'ASC' },
    });
  }

  async updateAffiliation(
    cooperativeId: string,
    workerId: string,
    dto: UpdateAffiliationDto,
  ): Promise<WorkerEntity> {
    const worker = await this.workerRepository.findOne({
      where: { id: workerId, cooperativeId },
    });
    if (!worker) {
      throw new NotFoundException(
        `Worker ${workerId} is not affiliated with Cooperative ${cooperativeId}`,
      );
    }

    if (dto.targetCooperativeId) {
      const targetCoop = await this.getCooperativeById(dto.targetCooperativeId);
      worker.cooperativeId = targetCoop.id;

      // Update membership history
      const currentMembership = await this.coopMembershipRepo.findOne({
        where: { workerId, cooperativeId, status: MembershipStatus.ACTIVE },
      });
      if (currentMembership) {
        currentMembership.status = MembershipStatus.INACTIVE;
        currentMembership.leftAt = new Date();
        await this.coopMembershipRepo.save(currentMembership);
      }

      await this.coopMembershipRepo.save(
        this.coopMembershipRepo.create({
          userId: worker.userId,
          cooperativeId: targetCoop.id,
          workerId: worker.id,
          memberId: worker.memberId,
          role: 'MEMBER_WORKER',
          status: MembershipStatus.ACTIVE,
        }),
      );

      await this.auditService.logAction(
        undefined,
        'REASSIGN_WORKER_AFFILIATION',
        'WORKER',
        worker.id,
        { fromCoop: cooperativeId, toCoop: targetCoop.id },
      );
    }

    return this.workerRepository.save(worker);
  }

  /**
   * Precise time-window aware capacity calculation.
   * Distinguishes total, active, available, committed, and available capacity.
   */
  async getCapacity(
    cooperativeId: string,
    query: { startDate?: string; endDate?: string; skillId?: string },
  ): Promise<IWorkforceCapacity> {
    await this.getCooperativeById(cooperativeId);

    const workerQb = this.workerRepository.createQueryBuilder('worker')
      .where('worker.cooperativeId = :cooperativeId', { cooperativeId });

    if (query.skillId) {
      workerQb.innerJoin('worker.workerSkills', 'ws', 'ws.skillId = :skillId', {
        skillId: query.skillId,
      });
    }

    const allWorkers = await workerQb.getMany();
    const totalWorkforce = allWorkers.length;
    const activeWorkers = allWorkers.filter((w) => w.status === AccountStatus.ACTIVE);
    const availableWorkers = activeWorkers.filter(
      (w) => (w.availabilityStatus as string) !== 'OFFLINE',
    );
    const unavailableWorkers = totalWorkforce - availableWorkers.length;

    // Committed workforce: active workers with overlapping confirmed/scheduled/in_progress bookings
    const activeWorkerIds = activeWorkers.map((w) => w.id);
    let committedWorkerIds = new Set<string>();

    if (activeWorkerIds.length > 0) {
      const bookingQb = this.bookingRepo.createQueryBuilder('booking')
        .where('booking.workerId IN (:...activeWorkerIds)', { activeWorkerIds })
        .andWhere('booking.status IN (:...activeStatuses)', {
          activeStatuses: [
            BookingStatus.CONFIRMED,
            BookingStatus.SCHEDULED,
            BookingStatus.IN_PROGRESS,
          ],
        });

      if (query.startDate && query.endDate) {
        const start = new Date(query.startDate);
        const end = new Date(query.endDate);
        bookingQb.andWhere(
          'booking.startTime <= :end AND (booking.endTime IS NULL OR booking.endTime >= :start)',
          { start, end },
        );
      }

      const activeBookings = await bookingQb.getMany();
      activeBookings.forEach((b) => {
        if (b.workerId) committedWorkerIds.add(b.workerId);
      });
    }

    const committedWorkforce = committedWorkerIds.size;
    const availableCapacity = Math.max(0, availableWorkers.length - committedWorkforce);

    // Skill breakdown
    const skills = await this.skillRepo.find();
    const workerSkills = await this.workerSkillRepo.find({
      where: activeWorkerIds.length > 0 ? { workerId: In(activeWorkerIds) } : {},
    });

    const bySkill = skills.map((s) => {
      const skilledWorkerIds = new Set(
        workerSkills.filter((ws) => ws.skillId === s.id).map((ws) => ws.workerId),
      );
      const skillTotal = allWorkers.filter((w) => skilledWorkerIds.has(w.id)).length;
      const skillCommitted = Array.from(committedWorkerIds).filter((id) =>
        skilledWorkerIds.has(id),
      ).length;
      const skillAvail = allWorkers.filter(
        (w) =>
          skilledWorkerIds.has(w.id) &&
          w.status === AccountStatus.ACTIVE &&
          (w.availabilityStatus as string) !== 'OFFLINE',
      ).length;

      return {
        skillId: s.id,
        skillName: s.name,
        total: skillTotal,
        available: Math.max(0, skillAvail - skillCommitted),
        committed: skillCommitted,
      };
    });

    return {
      cooperativeId,
      skillId: query.skillId,
      timeWindow:
        query.startDate && query.endDate
          ? { startDate: query.startDate, endDate: query.endDate }
          : undefined,
      totalWorkforce,
      activeWorkforce: activeWorkers.length,
      availableWorkers: availableWorkers.length,
      committedWorkforce,
      unavailableWorkers,
      availableCapacity,
      bySkill,
    };
  }

  async getUtilization(cooperativeId: string) {
    const capacity = await this.getCapacity(cooperativeId, {});
    const bookingsCount = await this.bookingRepo.count({
      where: { cooperativeId },
    });
    const completedCount = await this.bookingRepo.count({
      where: { cooperativeId, status: BookingStatus.COMPLETED },
    });

    const utilizationRate =
      capacity.activeWorkforce > 0
        ? Math.round((capacity.committedWorkforce / capacity.activeWorkforce) * 100)
        : 0;

    return {
      cooperativeId,
      totalWorkforce: capacity.totalWorkforce,
      activeWorkforce: capacity.activeWorkforce,
      committedWorkers: capacity.committedWorkforce,
      unassignedWorkers: capacity.availableCapacity,
      utilizationRate: `${utilizationRate}%`,
      totalBookingsDispatched: bookingsCount,
      completedJobs: completedCount,
    };
  }

  async getMemberships(cooperativeId: string, status?: MembershipStatus) {
    await this.getCooperativeById(cooperativeId);
    const qb = this.coopMembershipRepo
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .leftJoinAndSelect('membership.worker', 'worker')
      .where('membership.cooperativeId = :cooperativeId', { cooperativeId });

    if (status) {
      qb.andWhere('membership.status = :status', { status });
    }

    return qb.orderBy('membership.createdAt', 'DESC').getMany();
  }

  async updateMembershipStatus(
    cooperativeId: string,
    membershipId: string,
    newStatus: MembershipStatus,
    verifierUserId?: string,
    notes?: string,
  ) {
    await this.getCooperativeById(cooperativeId);
    const membership = await this.coopMembershipRepo.findOne({
      where: { id: membershipId, cooperativeId },
    });
    if (!membership) {
      throw new NotFoundException(`Membership ${membershipId} not found`);
    }

    const previousStatus = membership.status;
    membership.status = newStatus;
    if (verifierUserId) {
      membership.verifiedBy = verifierUserId;
      membership.verifiedAt = new Date();
    }
    if (notes) membership.notes = notes;
    if (newStatus === MembershipStatus.INACTIVE || newStatus === MembershipStatus.SUSPENDED) {
      membership.leftAt = new Date();
    }

    const saved = await this.coopMembershipRepo.save(membership);

    await this.auditService.logAction(
      verifierUserId,
      'UPDATE_MEMBERSHIP_STATUS',
      'COOPERATIVE_MEMBERSHIP',
      membership.id,
      { previousStatus, newStatus, cooperativeId, notes },
    );

    return saved;
  }

  async getWelfareAndTraining(cooperativeId: string) {
    await this.getCooperativeById(cooperativeId);
    const welfareRecords = await this.welfareRepo.find({
      where: { cooperativeId },
      relations: ['worker'],
      order: { createdAt: 'DESC' },
    });

    const members = await this.workerRepository.find({
      where: { cooperativeId },
      relations: ['certifications', 'workerSkills', 'workerSkills.skill'],
    });

    return {
      cooperativeId,
      welfareRecords,
      totalWelfareSchemes: welfareRecords.length,
      workersWithCertifications: members.filter(
        (m) => m.certifications && m.certifications.length > 0,
      ).length,
      members,
    };
  }
}

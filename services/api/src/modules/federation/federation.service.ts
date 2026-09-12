import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FederationEntity } from '../../database/entities/federation.entity';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { FederationMembershipEntity } from '../../database/entities/federation-membership.entity';
import { CooperativeMembershipEntity } from '../../database/entities/cooperative-membership.entity';
import { WorkforceRequirementEntity } from '../../database/entities/workforce-requirement.entity';
import { FulfillmentPlanEntity } from '../../database/entities/fulfillment-plan.entity';
import { FulfillmentAllocationEntity } from '../../database/entities/fulfillment-allocation.entity';
import { CooperativeService } from '../cooperative/cooperative.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateFulfillmentProposalDto,
  RespondAllocationDto,
} from './dto/federation.dto';
import {
  UserRole,
  MembershipStatus,
  FulfillmentPlanStatus,
  AllocationApprovalStatus,
  IFederationCapacity,
} from '@cshrk/types';

@Injectable()
export class FederationService {
  constructor(
    @InjectRepository(FederationEntity)
    private readonly fedRepo: Repository<FederationEntity>,
    @InjectRepository(CooperativeEntity)
    private readonly coopRepo: Repository<CooperativeEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepo: Repository<WorkerEntity>,
    @InjectRepository(FederationMembershipEntity)
    private readonly fedMembershipRepo: Repository<FederationMembershipEntity>,
    @InjectRepository(CooperativeMembershipEntity)
    private readonly coopMembershipRepo: Repository<CooperativeMembershipEntity>,
    @InjectRepository(WorkforceRequirementEntity)
    private readonly requirementRepo: Repository<WorkforceRequirementEntity>,
    @InjectRepository(FulfillmentPlanEntity)
    private readonly planRepo: Repository<FulfillmentPlanEntity>,
    @InjectRepository(FulfillmentAllocationEntity)
    private readonly allocRepo: Repository<FulfillmentAllocationEntity>,
    private readonly cooperativeService: CooperativeService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Scope verification for Federation Admin
   */
  async validateFederationAccess(
    user: { id: string; role: UserRole },
    federationId: string,
  ): Promise<FederationEntity> {
    const fed = await this.fedRepo.findOne({ where: { id: federationId } });
    if (!fed) {
      throw new NotFoundException(`Federation with ID ${federationId} not found`);
    }

    if (user.role === UserRole.PLATFORM_ADMIN) {
      return fed;
    }

    if (user.role === UserRole.FEDERATION_ADMIN) {
      const membership = await this.fedMembershipRepo.findOne({
        where: {
          userId: user.id,
          federationId,
          status: MembershipStatus.ACTIVE,
        },
      });
      if (!membership) {
        throw new ForbiddenException(
          'Access denied: You are not an active administrator of this federation network',
        );
      }
      return fed;
    }

    return fed;
  }

  async getMyFederation(user: { id: string; role: UserRole }): Promise<FederationEntity> {
    const membership = await this.fedMembershipRepo.findOne({
      where: { userId: user.id, status: MembershipStatus.ACTIVE },
      relations: ['federation'],
    });

    if (!membership || !membership.federation) {
      throw new NotFoundException('No active federation associated with your account');
    }

    return membership.federation;
  }

  async getFederationById(id: string): Promise<FederationEntity> {
    const fed = await this.fedRepo.findOne({ where: { id } });
    if (!fed) throw new NotFoundException(`Federation with ID ${id} not found`);
    return fed;
  }

  async listFederations(): Promise<FederationEntity[]> {
    return this.fedRepo.find({ order: { name: 'ASC' } });
  }

  async listMemberCooperatives(federationId: string) {
    await this.getFederationById(federationId);
    const coops = await this.coopRepo.find({
      where: { federationId },
      order: { name: 'ASC' },
    });

    const results = [];
    for (const c of coops) {
      const workerCount = await this.workerRepo.count({ where: { cooperativeId: c.id } });
      results.push({
        ...c,
        totalWorkers: workerCount,
      });
    }
    return results;
  }

  async getNetworkWorkforce(
    federationId: string,
    query: { skillId?: string; district?: string; search?: string },
  ) {
    await this.getFederationById(federationId);
    const coops = await this.coopRepo.find({ where: { federationId } });
    const coopIds = coops.map((c) => c.id);

    if (coopIds.length === 0) return [];

    const qb = this.workerRepo.createQueryBuilder('worker')
      .leftJoinAndSelect('worker.cooperative', 'cooperative')
      .leftJoinAndSelect('worker.workerSkills', 'workerSkill')
      .leftJoinAndSelect('workerSkill.skill', 'skill')
      .where('worker.cooperativeId IN (:...coopIds)', { coopIds });

    if (query.district) {
      qb.andWhere('cooperative.district = :district', { district: query.district });
    }
    if (query.skillId) {
      qb.andWhere('workerSkill.skillId = :skillId', { skillId: query.skillId });
    }
    if (query.search) {
      qb.andWhere('LOWER(worker.fullName) LIKE :s', { s: `%${query.search.toLowerCase()}%` });
    }

    return qb.orderBy('worker.fullName', 'ASC').getMany();
  }

  async getNetworkCapacity(
    federationId: string,
    query: { startDate?: string; endDate?: string; skillId?: string },
  ): Promise<IFederationCapacity> {
    await this.getFederationById(federationId);
    const coops = await this.coopRepo.find({ where: { federationId } });

    let totalWorkforce = 0;
    let activeWorkforce = 0;
    let availableWorkers = 0;
    let committedWorkforce = 0;
    let availableCapacity = 0;

    const coopCapacities = [];
    for (const c of coops) {
      const cap = await this.cooperativeService.getCapacity(c.id, query);
      totalWorkforce += cap.totalWorkforce;
      activeWorkforce += cap.activeWorkforce;
      availableWorkers += cap.availableWorkers;
      committedWorkforce += cap.committedWorkforce;
      availableCapacity += cap.availableCapacity;

      coopCapacities.push({
        cooperativeId: c.id,
        cooperativeName: c.name,
        district: c.district,
        capacity: cap,
      });
    }

    return {
      federationId,
      totalCooperatives: coops.length,
      totalWorkforce,
      activeWorkforce,
      availableWorkers,
      committedWorkforce,
      availableCapacity,
      cooperatives: coopCapacities,
    };
  }

  async getGeographicCoverage(federationId: string) {
    await this.getFederationById(federationId);
    const coops = await this.coopRepo.find({ where: { federationId } });
    const coopIds = coops.map((c) => c.id);

    const workersWithLocation = coopIds.length > 0
      ? await this.workerRepo.createQueryBuilder('worker')
          .select([
            'worker.id AS "workerId"',
            'worker.fullName AS "fullName"',
            'worker.cooperativeId AS "cooperativeId"',
            'worker.availabilityStatus AS "availabilityStatus"',
            'ST_AsGeoJSON(worker."currentLocation")::json AS "location"',
          ])
          .where('worker.cooperativeId IN (:...coopIds)', { coopIds })
          .andWhere('worker."currentLocation" IS NOT NULL')
          .getRawMany()
      : [];

    return {
      federationId,
      totalCooperatives: coops.length,
      cooperatives: coops.map((c) => ({
        id: c.id,
        name: c.name,
        district: c.district,
        contactPhone: c.contactPhone,
        serviceBoundary: c.serviceBoundary,
      })),
      workersCount: workersWithLocation.length,
      workerLocations: workersWithLocation,
    };
  }

  // ==============================================================================
  // MULTI-COOPERATIVE FULFILLMENT WORKFLOW (PROPOSAL -> APPROVAL -> CONFIRMED)
  // ==============================================================================

  async createFulfillmentProposal(
    federationId: string,
    dto: CreateFulfillmentProposalDto,
    creatorUserId?: string,
  ): Promise<FulfillmentPlanEntity> {
    await this.getFederationById(federationId);

    const requirement = await this.requirementRepo.findOne({
      where: { id: dto.requirementId },
    });
    if (!requirement) {
      throw new NotFoundException(`Workforce requirement ${dto.requirementId} not found`);
    }

    // Validate cooperatives belong to this federation
    const coopIds = dto.allocations.map((a) => a.cooperativeId);
    const memberCoops = await this.coopRepo.find({
      where: { id: In(coopIds), federationId },
    });
    if (memberCoops.length !== coopIds.length) {
      throw new ForbiddenException(
        'One or more allocated cooperatives do not belong to this federation',
      );
    }

    const plan = this.planRepo.create({
      requirementId: dto.requirementId,
      federationId,
      title: dto.title,
      notes: dto.notes,
      status: FulfillmentPlanStatus.PENDING_COOPERATIVE_APPROVAL,
    });
    const savedPlan = await this.planRepo.save(plan);

    for (const alloc of dto.allocations) {
      const allocation = this.allocRepo.create({
        planId: savedPlan.id,
        cooperativeId: alloc.cooperativeId,
        allocatedWorkers: alloc.allocatedWorkers,
        status: AllocationApprovalStatus.PENDING_APPROVAL,
      });
      await this.allocRepo.save(allocation);
    }

    await this.auditService.logAction(
      creatorUserId,
      'CREATE_FULFILLMENT_PROPOSAL',
      'FULFILLMENT_PLAN',
      savedPlan.id,
      { title: savedPlan.title, allocationsCount: dto.allocations.length },
    );

    return this.getFulfillmentPlanById(savedPlan.id);
  }

  async listFulfillmentPlans(federationId: string): Promise<FulfillmentPlanEntity[]> {
    await this.getFederationById(federationId);
    return this.planRepo.find({
      where: { federationId },
      relations: ['allocations', 'allocations.cooperative', 'requirement', 'requirement.skill'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFulfillmentPlanById(planId: string): Promise<FulfillmentPlanEntity> {
    const plan = await this.planRepo.findOne({
      where: { id: planId },
      relations: ['allocations', 'allocations.cooperative', 'requirement', 'requirement.skill'],
    });
    if (!plan) throw new NotFoundException(`Fulfillment plan ${planId} not found`);
    return plan;
  }

  async respondAllocation(
    allocationId: string,
    dto: RespondAllocationDto,
    user: { id: string; role: UserRole },
  ): Promise<FulfillmentAllocationEntity> {
    const allocation = await this.allocRepo.findOne({
      where: { id: allocationId },
      relations: ['plan'],
    });
    if (!allocation) {
      throw new NotFoundException(`Fulfillment allocation ${allocationId} not found`);
    }

    // Verify caller is admin of the assigned cooperative
    if (user.role === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({
        where: {
          userId: user.id,
          cooperativeId: allocation.cooperativeId,
          status: MembershipStatus.ACTIVE,
        },
      });
      if (!membership) {
        throw new ForbiddenException(
          'Access denied: You are not authorized to respond for this cooperative society',
        );
      }
    }

    allocation.status =
      dto.action === 'APPROVE'
        ? AllocationApprovalStatus.APPROVED
        : AllocationApprovalStatus.REJECTED;
    allocation.reviewedBy = user.id;
    allocation.reviewedAt = new Date();
    if (dto.rejectionReason) allocation.rejectionReason = dto.rejectionReason;

    const savedAlloc = await this.allocRepo.save(allocation);

    // Evaluate parent plan status
    const allAllocations = await this.allocRepo.find({
      where: { planId: allocation.planId },
    });

    const anyPending = allAllocations.some(
      (a) => a.status === AllocationApprovalStatus.PENDING_APPROVAL,
    );
    const anyApproved = allAllocations.some(
      (a) => a.status === AllocationApprovalStatus.APPROVED,
    );
    const allApproved = allAllocations.every(
      (a) => a.status === AllocationApprovalStatus.APPROVED,
    );
    const allRejected = allAllocations.every(
      (a) => a.status === AllocationApprovalStatus.REJECTED,
    );

    const plan = allocation.plan;
    if (allApproved) {
      plan.status = FulfillmentPlanStatus.CONFIRMED;
    } else if (allRejected) {
      plan.status = FulfillmentPlanStatus.REJECTED;
    } else if (anyApproved && !anyPending) {
      plan.status = FulfillmentPlanStatus.PARTIALLY_APPROVED;
    } else {
      plan.status = FulfillmentPlanStatus.PENDING_COOPERATIVE_APPROVAL;
    }
    await this.planRepo.save(plan);

    await this.auditService.logAction(
      user.id,
      `RESPOND_FULFILLMENT_ALLOCATION_${dto.action}`,
      'FULFILLMENT_ALLOCATION',
      allocation.id,
      {
        planId: allocation.planId,
        cooperativeId: allocation.cooperativeId,
        newPlanStatus: plan.status,
      },
    );

    return savedAlloc;
  }
}

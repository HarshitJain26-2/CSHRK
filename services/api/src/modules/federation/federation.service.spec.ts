import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FederationService } from './federation.service';
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
  UserRole,
  MembershipStatus,
  FulfillmentPlanStatus,
  AllocationApprovalStatus,
} from '@cshrk/types';

describe('FederationService (Network Aggregation & Multi-Coop Fulfillment Tests)', () => {
  let service: FederationService;
  let fedRepo: any;
  let coopRepo: any;
  let workerRepo: any;
  let fedMembershipRepo: any;
  let coopMembershipRepo: any;
  let requirementRepo: any;
  let planRepo: any;
  let allocRepo: any;
  let cooperativeService: any;
  let auditService: any;

  beforeEach(async () => {
    fedRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    coopRepo = {
      find: jest.fn(),
    };
    workerRepo = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    fedMembershipRepo = {
      findOne: jest.fn(),
    };
    coopMembershipRepo = {
      findOne: jest.fn(),
    };
    requirementRepo = {
      findOne: jest.fn(),
    };
    planRepo = {
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'plan-1', ...d })),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    allocRepo = {
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'alloc-1', ...d })),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    cooperativeService = {
      getCapacity: jest.fn().mockResolvedValue({
        totalWorkforce: 10,
        activeWorkforce: 8,
        availableWorkers: 7,
        committedWorkforce: 2,
        availableCapacity: 5,
      }),
    };
    auditService = {
      logAction: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FederationService,
        { provide: getRepositoryToken(FederationEntity), useValue: fedRepo },
        { provide: getRepositoryToken(CooperativeEntity), useValue: coopRepo },
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
        { provide: getRepositoryToken(FederationMembershipEntity), useValue: fedMembershipRepo },
        { provide: getRepositoryToken(CooperativeMembershipEntity), useValue: coopMembershipRepo },
        { provide: getRepositoryToken(WorkforceRequirementEntity), useValue: requirementRepo },
        { provide: getRepositoryToken(FulfillmentPlanEntity), useValue: planRepo },
        { provide: getRepositoryToken(FulfillmentAllocationEntity), useValue: allocRepo },
        { provide: CooperativeService, useValue: cooperativeService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<FederationService>(FederationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Federation Network Scope Isolation', () => {
    it('should allow FEDERATION_ADMIN if affiliated with federation', async () => {
      fedRepo.findOne.mockResolvedValue({ id: 'fed-1', name: 'State Fed' });
      fedMembershipRepo.findOne.mockResolvedValue({ id: 'mem-1', status: MembershipStatus.ACTIVE });

      const fed = await service.validateFederationAccess(
        { id: 'user-1', role: UserRole.FEDERATION_ADMIN },
        'fed-1',
      );
      expect(fed.id).toBe('fed-1');
    });

    it('should deny FEDERATION_ADMIN from another federation', async () => {
      fedRepo.findOne.mockResolvedValue({ id: 'fed-2', name: 'Other Fed' });
      fedMembershipRepo.findOne.mockResolvedValue(null);

      await expect(
        service.validateFederationAccess(
          { id: 'user-1', role: UserRole.FEDERATION_ADMIN },
          'fed-2',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Network Capacity Aggregation', () => {
    it('should aggregate capacity across member cooperatives', async () => {
      fedRepo.findOne.mockResolvedValue({ id: 'fed-1' });
      coopRepo.find.mockResolvedValue([
        { id: 'coop-1', name: 'Coop 1', district: 'Delhi North' },
        { id: 'coop-2', name: 'Coop 2', district: 'Delhi South' },
      ]);

      const netCap = await service.getNetworkCapacity('fed-1', {});

      expect(netCap.totalCooperatives).toBe(2);
      expect(netCap.totalWorkforce).toBe(20);
      expect(netCap.availableCapacity).toBe(10);
    });
  });

  describe('Multi-Cooperative Fulfillment Proposal & Approval Workflow', () => {
    it('should create proposal in PENDING_COOPERATIVE_APPROVAL state without silently committing capacity', async () => {
      fedRepo.findOne.mockResolvedValue({ id: 'fed-1' });
      requirementRepo.findOne.mockResolvedValue({ id: 'req-1', quantity: 20 });
      coopRepo.find.mockResolvedValue([{ id: 'coop-1' }, { id: 'coop-2' }]);
      planRepo.findOne.mockResolvedValue({
        id: 'plan-1',
        status: FulfillmentPlanStatus.PENDING_COOPERATIVE_APPROVAL,
        allocations: [],
      });

      const plan = await service.createFulfillmentProposal(
        'fed-1',
        {
          requirementId: 'req-1',
          title: 'Emergency Overhaul',
          allocations: [
            { cooperativeId: 'coop-1', allocatedWorkers: 10 },
            { cooperativeId: 'coop-2', allocatedWorkers: 10 },
          ],
        },
        'fed-admin-1',
      );

      expect(planRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: FulfillmentPlanStatus.PENDING_COOPERATIVE_APPROVAL,
        }),
      );
      expect(allocRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should transition plan to CONFIRMED once all cooperatives approve', async () => {
      const mockPlan = {
        id: 'plan-1',
        status: FulfillmentPlanStatus.PENDING_COOPERATIVE_APPROVAL,
      };
      allocRepo.findOne.mockResolvedValue({
        id: 'alloc-1',
        planId: 'plan-1',
        cooperativeId: 'coop-1',
        status: AllocationApprovalStatus.PENDING_APPROVAL,
        plan: mockPlan,
      });

      coopMembershipRepo.findOne.mockResolvedValue({ id: 'mem-1' });

      allocRepo.find.mockResolvedValue([
        { id: 'alloc-1', status: AllocationApprovalStatus.APPROVED },
        { id: 'alloc-2', status: AllocationApprovalStatus.APPROVED },
      ]);

      const updatedAlloc = await service.respondAllocation(
        'alloc-1',
        { action: 'APPROVE' },
        { id: 'coop-admin-1', role: UserRole.COOPERATIVE_ADMIN },
      );

      expect(updatedAlloc.status).toBe(AllocationApprovalStatus.APPROVED);
      expect(planRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: FulfillmentPlanStatus.CONFIRMED }),
      );
    });
  });
});

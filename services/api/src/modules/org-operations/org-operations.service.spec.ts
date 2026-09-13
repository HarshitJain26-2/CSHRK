import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrgOperationsService } from './org-operations.service';
import { ContractEntity } from '../../database/entities/contract.entity';
import { ProjectEntity } from '../../database/entities/project.entity';
import { LargeJobEntity } from '../../database/entities/large-job.entity';
import { WorkforceRequirementEntity } from '../../database/entities/workforce-requirement.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CooperativeService } from '../cooperative/cooperative.service';
import { AuditService } from '../audit/audit.service';
import {
  UserRole,
  ContractStatus,
  ProjectStatus,
  JobStatus,
  RequirementStatus,
  AccountStatus,
} from '@cshrk/types';

describe('OrgOperationsService (Contracts, Projects, Large Jobs, Requirements Tests)', () => {
  let service: OrgOperationsService;
  let contractRepo: any;
  let projectRepo: any;
  let jobRepo: any;
  let reqRepo: any;
  let workerRepo: any;
  let coopService: any;
  let auditService: any;

  beforeEach(async () => {
    contractRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'cnt-1', ...d })),
      createQueryBuilder: jest.fn(),
    };
    projectRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'proj-1', ...d })),
      createQueryBuilder: jest.fn(),
    };
    jobRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'job-1', ...d })),
      createQueryBuilder: jest.fn(),
    };
    reqRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'req-1', ...d })),
    };
    workerRepo = {
      createQueryBuilder: jest.fn(),
    };
    coopService = {
      validateCooperativeAccess: jest.fn().mockResolvedValue({ id: 'coop-1' }),
    };
    auditService = {
      logAction: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrgOperationsService,
        { provide: getRepositoryToken(ContractEntity), useValue: contractRepo },
        { provide: getRepositoryToken(ProjectEntity), useValue: projectRepo },
        { provide: getRepositoryToken(LargeJobEntity), useValue: jobRepo },
        { provide: getRepositoryToken(WorkforceRequirementEntity), useValue: reqRepo },
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
        { provide: CooperativeService, useValue: coopService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<OrgOperationsService>(OrgOperationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Contracts', () => {
    it('should create contract and audit log', async () => {
      contractRepo.findOne.mockResolvedValue(null);

      const contract = await service.createContract(
        {
          contractNumber: 'CNT-101',
          title: 'Facility Overhaul',
          clientName: 'City Council',
          scope: 'Major facility maintenance',
          startDate: '2026-10-01T00:00:00.000Z',
          endDate: '2026-12-31T00:00:00.000Z',
        },
        { id: 'user-1', role: UserRole.COOPERATIVE_ADMIN },
      );

      expect(contract.contractNumber).toBe('CNT-101');
      expect(auditService.logAction).toHaveBeenCalledWith(
        'user-1',
        'CREATE_CONTRACT',
        'CONTRACT',
        'cnt-1',
        expect.anything(),
      );
    });
  });

  describe('Large Jobs (Operational, Zero Pricing)', () => {
    it('should create large job with required workers count', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: 'job-1',
        title: 'Block A Rewiring',
        requiredWorkers: 8,
        status: JobStatus.OPEN,
      });

      const job = await service.createLargeJob(
        {
          cooperativeId: 'coop-1',
          title: 'Block A Rewiring',
          organizationName: 'City Hospital',
          skillId: 'skill-1',
          requiredWorkers: 8,
          startDate: '2026-10-01T00:00:00.000Z',
          endDate: '2026-10-15T00:00:00.000Z',
        },
        { id: 'user-1', role: UserRole.COOPERATIVE_ADMIN },
      );

      expect(job.title).toBe('Block A Rewiring');
      expect(job.requiredWorkers).toBe(8);
      expect((job as any).dailyRate).toBeUndefined(); // strictly NO dailyRate!
    });
  });

  describe('Workforce Requirements & Deterministic Fulfillment', () => {
    it('should calculate deterministic fulfillment capacity', async () => {
      reqRepo.findOne.mockResolvedValue({
        id: 'req-1',
        skillId: 'skill-1',
        quantity: 5,
        locationCity: 'Delhi',
      });

      const mockMatchingWorkers = [
        { id: 'w-1', fullName: 'Amit', cooperativeId: 'coop-1' },
        { id: 'w-2', fullName: 'Sunil', cooperativeId: 'coop-1' },
        { id: 'w-3', fullName: 'Rajesh', cooperativeId: 'coop-2' },
      ];

      const workerQb: any = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockMatchingWorkers),
      };
      workerRepo.createQueryBuilder.mockReturnValue(workerQb);

      const res = await service.getWorkforceRequirementById('req-1');

      expect(res.deterministicEvaluation.requiredQuantity).toBe(5);
      expect(res.deterministicEvaluation.availableMatchingWorkers).toBe(3);
      expect(res.deterministicEvaluation.fulfillmentCapacity).toBe('PARTIAL');
    });
  });
});

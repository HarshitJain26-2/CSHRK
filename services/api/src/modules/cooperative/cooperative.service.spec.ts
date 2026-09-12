import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CooperativeService } from './cooperative.service';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CooperativeMembershipEntity } from '../../database/entities/cooperative-membership.entity';
import { FederationMembershipEntity } from '../../database/entities/federation-membership.entity';
import { BookingEntity } from '../../database/entities/booking.entity';
import { SkillEntity } from '../../database/entities/skill.entity';
import { WorkerSkillEntity } from '../../database/entities/worker-skill.entity';
import { WelfareRecordEntity } from '../../database/entities/welfare-record.entity';
import { AuditService } from '../audit/audit.service';
import { UserRole, MembershipStatus, AccountStatus, WorkerAvailabilityStatus } from '@cshrk/types';

describe('CooperativeService (Phase 3 Operations & Capacity Tests)', () => {
  let service: CooperativeService;
  let coopRepo: any;
  let workerRepo: any;
  let coopMemberRepo: any;
  let fedMemberRepo: any;
  let bookingRepo: any;
  let skillRepo: any;
  let workerSkillRepo: any;
  let welfareRepo: any;
  let auditService: any;

  beforeEach(async () => {
    coopRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'coop-1', ...d })),
      createQueryBuilder: jest.fn(),
    };
    workerRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((w) => Promise.resolve(w)),
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
    };
    coopMemberRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'mem-1', ...d })),
      createQueryBuilder: jest.fn(),
    };
    fedMemberRepo = {
      findOne: jest.fn(),
    };
    bookingRepo = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    skillRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    workerSkillRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    welfareRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    auditService = {
      logAction: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CooperativeService,
        { provide: getRepositoryToken(CooperativeEntity), useValue: coopRepo },
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
        { provide: getRepositoryToken(CooperativeMembershipEntity), useValue: coopMemberRepo },
        { provide: getRepositoryToken(FederationMembershipEntity), useValue: fedMemberRepo },
        { provide: getRepositoryToken(BookingEntity), useValue: bookingRepo },
        { provide: getRepositoryToken(SkillEntity), useValue: skillRepo },
        { provide: getRepositoryToken(WorkerSkillEntity), useValue: workerSkillRepo },
        { provide: getRepositoryToken(WelfareRecordEntity), useValue: welfareRepo },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<CooperativeService>(CooperativeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Scope Isolation & Access Validation', () => {
    it('should allow PLATFORM_ADMIN to access any cooperative', async () => {
      coopRepo.findOne.mockResolvedValue({ id: 'coop-1', name: 'Society 1' });
      const coop = await service.validateCooperativeAccess(
        { id: 'admin-1', role: UserRole.PLATFORM_ADMIN },
        'coop-1',
      );
      expect(coop.id).toBe('coop-1');
    });

    it('should allow COOPERATIVE_ADMIN only if they have active membership in the cooperative', async () => {
      coopRepo.findOne.mockResolvedValue({ id: 'coop-1', name: 'Society 1' });
      coopMemberRepo.findOne.mockResolvedValue({ id: 'mem-1', status: MembershipStatus.ACTIVE });

      const coop = await service.validateCooperativeAccess(
        { id: 'user-1', role: UserRole.COOPERATIVE_ADMIN },
        'coop-1',
      );
      expect(coop.id).toBe('coop-1');
    });

    it('should throw ForbiddenException if COOPERATIVE_ADMIN tries to access another cooperative', async () => {
      coopRepo.findOne.mockResolvedValue({ id: 'coop-2', name: 'Society 2' });
      coopMemberRepo.findOne.mockResolvedValue(null);

      await expect(
        service.validateCooperativeAccess(
          { id: 'user-1', role: UserRole.COOPERATIVE_ADMIN },
          'coop-2',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Time-Window Aware Capacity Calculations', () => {
    it('should calculate total, active, available, committed, and available capacity', async () => {
      coopRepo.findOne.mockResolvedValue({ id: 'coop-1' });

      const workers = [
        { id: 'w-1', status: AccountStatus.ACTIVE, availabilityStatus: WorkerAvailabilityStatus.AVAILABLE },
        { id: 'w-2', status: AccountStatus.ACTIVE, availabilityStatus: WorkerAvailabilityStatus.AVAILABLE },
        { id: 'w-3', status: AccountStatus.ACTIVE, availabilityStatus: WorkerAvailabilityStatus.OFFLINE },
        { id: 'w-4', status: AccountStatus.INACTIVE, availabilityStatus: WorkerAvailabilityStatus.OFFLINE },
      ];

      const workerQb: any = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(workers),
      };
      workerRepo.createQueryBuilder.mockReturnValue(workerQb);

      // w-1 has an active booking overlapping
      const bookingQb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'b-1', workerId: 'w-1' }]),
      };
      bookingRepo.createQueryBuilder.mockReturnValue(bookingQb);

      const cap = await service.getCapacity('coop-1', {
        startDate: '2026-10-01T09:00:00.000Z',
        endDate: '2026-10-10T18:00:00.000Z',
      });

      expect(cap.totalWorkforce).toBe(4);
      expect(cap.activeWorkforce).toBe(3);
      expect(cap.availableWorkers).toBe(2);
      expect(cap.committedWorkforce).toBe(1); // w-1
      expect(cap.unavailableWorkers).toBe(2); // w-3 and w-4
      expect(cap.availableCapacity).toBe(1); // 2 available - 1 committed = 1
    });
  });

  describe('Membership & Status Management', () => {
    it('should update membership status and record audit log', async () => {
      coopRepo.findOne.mockResolvedValue({ id: 'coop-1' });
      coopMemberRepo.findOne.mockResolvedValue({
        id: 'mem-1',
        cooperativeId: 'coop-1',
        status: MembershipStatus.PENDING,
      });

      const updated = await service.updateMembershipStatus(
        'coop-1',
        'mem-1',
        MembershipStatus.ACTIVE,
        'verifier-1',
        'Approved by committee',
      );

      expect(updated.status).toBe(MembershipStatus.ACTIVE);
      expect(updated.verifiedBy).toBe('verifier-1');
      expect(auditService.logAction).toHaveBeenCalledWith(
        'verifier-1',
        'UPDATE_MEMBERSHIP_STATUS',
        'COOPERATIVE_MEMBERSHIP',
        'mem-1',
        expect.anything(),
      );
    });
  });
});

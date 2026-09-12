import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TeamService } from './team.service';
import { WorkerTeamEntity } from '../../database/entities/worker-team.entity';
import { TeamMemberEntity } from '../../database/entities/team-member.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CooperativeService } from '../cooperative/cooperative.service';
import { AuditService } from '../audit/audit.service';
import { UserRole, TeamMemberRole, TeamStatus } from '@cshrk/types';

describe('TeamService (Worker Crews & Teams Tests)', () => {
  let service: TeamService;
  let teamRepo: any;
  let memberRepo: any;
  let workerRepo: any;
  let coopService: any;
  let auditService: any;

  beforeEach(async () => {
    teamRepo = {
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'team-1', ...d })),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    memberRepo = {
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'tm-1', ...d })),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    workerRepo = {
      findOne: jest.fn(),
    };
    coopService = {
      validateCooperativeAccess: jest.fn().mockResolvedValue({ id: 'coop-1' }),
    };
    auditService = {
      logAction: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: getRepositoryToken(WorkerTeamEntity), useValue: teamRepo },
        { provide: getRepositoryToken(TeamMemberEntity), useValue: memberRepo },
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
        { provide: CooperativeService, useValue: coopService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTeam', () => {
    it('should create crew and assign leader', async () => {
      workerRepo.findOne.mockResolvedValue({ id: 'w-1', cooperativeId: 'coop-1' });
      teamRepo.findOne.mockResolvedValue({
        id: 'team-1',
        name: 'Electrical Rapid Response',
        cooperativeId: 'coop-1',
        members: [{ id: 'tm-1', workerId: 'w-1', role: TeamMemberRole.LEADER }],
      });

      const result = await service.createTeam(
        {
          cooperativeId: 'coop-1',
          name: 'Electrical Rapid Response',
          leaderWorkerId: 'w-1',
        },
        { id: 'admin-1', role: UserRole.COOPERATIVE_ADMIN },
      );

      expect(teamRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Electrical Rapid Response', status: TeamStatus.ACTIVE }),
      );
      expect(memberRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ role: TeamMemberRole.LEADER }),
      );
      expect(result.id).toBe('team-1');
    });
  });

  describe('addTeamMember', () => {
    it('should add worker to crew', async () => {
      teamRepo.findOne.mockResolvedValue({ id: 'team-1', cooperativeId: 'coop-1' });
      workerRepo.findOne.mockResolvedValue({ id: 'w-2', cooperativeId: 'coop-1' });
      memberRepo.findOne.mockResolvedValue(null);

      const member = await service.addTeamMember(
        'team-1',
        { workerId: 'w-2', role: TeamMemberRole.MEMBER },
        { id: 'admin-1', role: UserRole.COOPERATIVE_ADMIN },
      );

      expect(member.teamId).toBe('team-1');
      expect(member.workerId).toBe('w-2');
    });
  });
});

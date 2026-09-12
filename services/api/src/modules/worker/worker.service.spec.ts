import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { WorkerSkillEntity } from '../../database/entities/worker-skill.entity';
import { SkillEntity } from '../../database/entities/skill.entity';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { BookingEntity } from '../../database/entities/booking.entity';
import { CertificationEntity } from '../../database/entities/certification.entity';
import {
  WorkerAvailabilityStatus,
  WorkerEmploymentType,
  ProficiencyLevel,
  BookingStatus,
} from '@cshrk/types';

describe('WorkerService (Phase 1 Unit Tests)', () => {
  let service: WorkerService;
  let workerRepo: any;
  let workerSkillRepo: any;
  let skillRepo: any;
  let cooperativeRepo: any;
  let bookingRepo: any;
  let certRepo: any;

  beforeEach(async () => {
    workerRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn().mockResolvedValue(10),
      createQueryBuilder: jest.fn(),
    };
    workerSkillRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    skillRepo = {
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(25),
    };
    cooperativeRepo = {
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(4),
    };
    bookingRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    certRepo = {
      count: jest.fn().mockResolvedValue(15),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerService,
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
        { provide: getRepositoryToken(WorkerSkillEntity), useValue: workerSkillRepo },
        { provide: getRepositoryToken(SkillEntity), useValue: skillRepo },
        { provide: getRepositoryToken(CooperativeEntity), useValue: cooperativeRepo },
        { provide: getRepositoryToken(BookingEntity), useValue: bookingRepo },
        { provide: getRepositoryToken(CertificationEntity), useValue: certRepo },
      ],
    }).compile();

    service = module.get<WorkerService>(WorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfileByUserId', () => {
    it('should return worker profile if found', async () => {
      const mockWorker = { id: 'w-1', userId: 'u-1', fullName: 'Ramesh Kumar' };
      workerRepo.findOne.mockResolvedValue(mockWorker);

      const result = await service.getProfileByUserId('u-1');
      expect(result).toEqual(mockWorker);
    });

    it('should throw NotFoundException if worker not found', async () => {
      workerRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfileByUserId('u-none')).rejects.toThrow(NotFoundException);
    });
  });

  describe('onboardWorker', () => {
    it('should throw ConflictException if worker already registered', async () => {
      workerRepo.findOne.mockResolvedValue({ id: 'w-1' });

      await expect(
        service.onboardWorker('u-1', {
          cooperativeId: 'coop-1',
          fullName: 'Ramesh Kumar',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if cooperative does not exist', async () => {
      workerRepo.findOne.mockResolvedValue(null);
      cooperativeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.onboardWorker('u-1', {
          cooperativeId: 'non-existent-coop',
          fullName: 'Ramesh Kumar',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully onboard worker', async () => {
      workerRepo.findOne.mockResolvedValue(null);
      cooperativeRepo.findOne.mockResolvedValue({ id: 'coop-1', name: 'Delhi Labour Society' });
      const createdWorker = {
        userId: 'u-1',
        cooperativeId: 'coop-1',
        fullName: 'Ramesh Kumar',
        availabilityStatus: WorkerAvailabilityStatus.AVAILABLE,
      };
      workerRepo.create.mockReturnValue(createdWorker);
      workerRepo.save.mockResolvedValue({ id: 'w-100', ...createdWorker });

      const result = await service.onboardWorker('u-1', {
        cooperativeId: 'coop-1',
        fullName: 'Ramesh Kumar',
      });

      expect(result.id).toBe('w-100');
      expect(result.fullName).toBe('Ramesh Kumar');
    });
  });

  describe('updateAvailability', () => {
    it('should update availability status', async () => {
      const mockWorker = {
        id: 'w-1',
        userId: 'u-1',
        availabilityStatus: WorkerAvailabilityStatus.AVAILABLE,
      };
      workerRepo.findOne.mockResolvedValue(mockWorker);
      workerRepo.save.mockImplementation((w: any) => Promise.resolve(w));

      const updated = await service.updateAvailability('u-1', {
        availabilityStatus: WorkerAvailabilityStatus.BUSY,
      });

      expect(updated.availabilityStatus).toBe(WorkerAvailabilityStatus.BUSY);
    });
  });

  describe('updateLocation', () => {
    it('should update PostGIS geometry point', async () => {
      const mockWorker = { id: 'w-1', userId: 'u-1' };
      workerRepo.findOne.mockResolvedValue(mockWorker);
      workerRepo.save.mockImplementation((w: any) => Promise.resolve(w));

      const updated = await service.updateLocation('u-1', {
        latitude: 28.6139,
        longitude: 77.209,
      });

      expect(updated.currentLocation).toEqual({
        type: 'Point',
        coordinates: [77.209, 28.6139],
      });
    });
  });

  describe('claimSkill', () => {
    it('should throw NotFoundException if skill does not exist', async () => {
      workerRepo.findOne.mockResolvedValue({ id: 'w-1', userId: 'u-1' });
      skillRepo.findOne.mockResolvedValue(null);

      await expect(
        service.claimSkill('u-1', {
          skillId: 's-99',
          proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if skill is already in passport', async () => {
      workerRepo.findOne.mockResolvedValue({ id: 'w-1', userId: 'u-1' });
      skillRepo.findOne.mockResolvedValue({ id: 's-1', name: 'Electrician' });
      workerSkillRepo.findOne.mockResolvedValue({ id: 'ws-1' });

      await expect(
        service.claimSkill('u-1', {
          skillId: 's-1',
          proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register skill claim as unverified', async () => {
      workerRepo.findOne.mockResolvedValue({ id: 'w-1', userId: 'u-1' });
      skillRepo.findOne.mockResolvedValue({ id: 's-1', name: 'Electrician' });
      workerSkillRepo.findOne.mockResolvedValue(null);
      const newClaim = {
        workerId: 'w-1',
        skillId: 's-1',
        proficiencyLevel: ProficiencyLevel.EXPERT,
        isVerified: false,
      };
      workerSkillRepo.create.mockReturnValue(newClaim);
      workerSkillRepo.save.mockResolvedValue({ id: 'ws-10', ...newClaim });

      const result = await service.claimSkill('u-1', {
        skillId: 's-1',
        proficiencyLevel: ProficiencyLevel.EXPERT,
      });

      expect(result.isVerified).toBe(false);
      expect(result.proficiencyLevel).toBe(ProficiencyLevel.EXPERT);
    });
  });

  describe('verifySkill', () => {
    it('should verify worker skill', async () => {
      const mockRecord = { id: 'ws-1', workerId: 'w-1', skillId: 's-1', isVerified: false };
      workerSkillRepo.findOne.mockResolvedValue(mockRecord);
      workerSkillRepo.save.mockImplementation((r: any) => Promise.resolve(r));

      const verified = await service.verifySkill('w-1', 's-1', { isVerified: true });
      expect(verified.isVerified).toBe(true);
    });

    it('should throw NotFoundException if record not found', async () => {
      workerSkillRepo.findOne.mockResolvedValue(null);

      await expect(
        service.verifySkill('w-1', 's-99', { isVerified: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('respondToJob', () => {
    it('should accept job assignment', async () => {
      workerRepo.findOne.mockResolvedValue({ id: 'w-1', userId: 'u-1' });
      const mockBooking = { id: 'b-1', workerId: 'w-1', status: BookingStatus.CONFIRMED };
      bookingRepo.findOne.mockResolvedValue(mockBooking);
      bookingRepo.save.mockResolvedValue(mockBooking);

      const response = await service.respondToJob('u-1', 'b-1', { action: 'ACCEPT' });
      expect(response.message).toContain('accepted');
      expect(response.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should decline job assignment', async () => {
      workerRepo.findOne.mockResolvedValue({ id: 'w-1', userId: 'u-1' });
      const mockBooking = { id: 'b-1', workerId: 'w-1', status: BookingStatus.CONFIRMED };
      bookingRepo.findOne.mockResolvedValue(mockBooking);
      bookingRepo.save.mockResolvedValue(mockBooking);

      const response = await service.respondToJob('u-1', 'b-1', {
        action: 'DECLINE',
        reason: 'Too far from current location',
      });
      expect(response.message).toContain('declined');
      expect(response.status).toBe(BookingStatus.CANCELLED);
    });
  });

  describe('updateWorker', () => {
    it('should update worker fields', async () => {
      const mockWorker = { id: 'w-1', fullName: 'Ramesh Old' };
      workerRepo.findOne.mockResolvedValue(mockWorker);
      workerRepo.save.mockImplementation((w: any) => Promise.resolve(w));

      const updated = await service.updateWorker('w-1', { fullName: 'Ramesh New' });
      expect(updated.fullName).toBe('Ramesh New');
    });
  });

  describe('updateWorkerStatus', () => {
    it('should update worker availability status', async () => {
      const mockWorker = { id: 'w-1', availabilityStatus: WorkerAvailabilityStatus.AVAILABLE };
      workerRepo.findOne.mockResolvedValue(mockWorker);
      workerRepo.save.mockImplementation((w: any) => Promise.resolve(w));

      const updated = await service.updateWorkerStatus('w-1', {
        availabilityStatus: WorkerAvailabilityStatus.OFFLINE,
      });
      expect(updated.availabilityStatus).toBe(WorkerAvailabilityStatus.OFFLINE);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return computed metrics from database', async () => {
      const metrics = await service.getDashboardMetrics();
      expect(metrics.totalWorkforce).toBe(10);
      expect(metrics.totalSkills).toBe(25);
      expect(metrics.totalCooperatives).toBe(4);
      expect(metrics.totalCertifications).toBe(15);
    });
  });
});


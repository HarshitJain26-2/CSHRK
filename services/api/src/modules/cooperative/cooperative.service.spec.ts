import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CooperativeService } from './cooperative.service';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';

describe('CooperativeService (Phase 1 Unit Tests)', () => {
  let service: CooperativeService;
  let coopRepo: any;
  let workerRepo: any;

  beforeEach(async () => {
    coopRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    workerRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CooperativeService,
        { provide: getRepositoryToken(CooperativeEntity), useValue: coopRepo },
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
      ],
    }).compile();

    service = module.get<CooperativeService>(CooperativeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCooperative', () => {
    it('should throw ConflictException if registration number exists', async () => {
      coopRepo.findOne.mockResolvedValue({ id: 'coop-1', registrationNumber: 'REG-101' });

      await expect(
        service.createCooperative({
          federationId: 'fed-1',
          name: 'Central Cooperative',
          registrationNumber: 'REG-101',
          district: 'New Delhi',
          contactEmail: 'contact@centralcoop.local',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and save cooperative', async () => {
      coopRepo.findOne.mockResolvedValue(null);
      const newCoop = { id: 'coop-1', name: 'Central Cooperative' };
      coopRepo.create.mockReturnValue(newCoop);
      coopRepo.save.mockResolvedValue(newCoop);

      const result = await service.createCooperative({
        federationId: 'fed-1',
        name: 'Central Cooperative',
        registrationNumber: 'REG-101',
        district: 'New Delhi',
        contactEmail: 'contact@centralcoop.local',
      });

      expect(result.name).toBe('Central Cooperative');
    });
  });

  describe('getCooperativeMembers', () => {
    it('should return member workers of cooperative', async () => {
      coopRepo.findOne.mockResolvedValue({ id: 'coop-1' });
      const members = [{ id: 'w-1', fullName: 'Ramesh' }, { id: 'w-2', fullName: 'Suresh' }];
      workerRepo.find.mockResolvedValue(members);

      const result = await service.getCooperativeMembers('coop-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('updateAffiliation', () => {
    it('should update worker cooperative affiliation', async () => {
      const worker = { id: 'w-1', cooperativeId: 'coop-1' };
      workerRepo.findOne.mockResolvedValue(worker);
      coopRepo.findOne.mockResolvedValue({ id: 'coop-2' });
      workerRepo.save.mockImplementation((w: any) => Promise.resolve(w));

      const updated = await service.updateAffiliation('coop-1', 'w-1', {
        targetCooperativeId: 'coop-2',
      });

      expect(updated.cooperativeId).toBe('coop-2');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillEntity } from '../../database/entities/skill.entity';
import { WorkerSkillEntity } from '../../database/entities/worker-skill.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { ProficiencyLevel } from '@cshrk/types';

describe('SkillService (Phase 1 Unit Tests)', () => {
  let service: SkillService;
  let skillRepo: any;
  let workerSkillRepo: any;
  let workerRepo: any;

  beforeEach(async () => {
    skillRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    workerSkillRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    workerRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillService,
        { provide: getRepositoryToken(SkillEntity), useValue: skillRepo },
        { provide: getRepositoryToken(WorkerSkillEntity), useValue: workerSkillRepo },
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
      ],
    }).compile();

    service = module.get<SkillService>(SkillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSkill', () => {
    it('should throw ConflictException if skill code already exists', async () => {
      skillRepo.findOne.mockResolvedValue({ id: 's-1', code: 'ELEC-01' });

      await expect(
        service.createSkill({
          code: 'ELEC-01',
          name: 'Electrical Wiring',
          category: 'Electrical',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and save skill', async () => {
      skillRepo.findOne.mockResolvedValue(null);
      const skill = { id: 's-1', code: 'ELEC-01', name: 'Electrical Wiring', category: 'Electrical' };
      skillRepo.create.mockReturnValue(skill);
      skillRepo.save.mockResolvedValue(skill);

      const result = await service.createSkill({
        code: 'ELEC-01',
        name: 'Electrical Wiring',
        category: 'Electrical',
      });
      expect(result.code).toBe('ELEC-01');
    });
  });

  describe('assignSkillToWorker', () => {
    it('should assign new skill to worker with given proficiency', async () => {
      skillRepo.findOne.mockResolvedValue({ id: 's-1', name: 'Plumbing' });
      workerRepo.findOne.mockResolvedValue({ id: 'w-1', fullName: 'Ramesh' });
      workerSkillRepo.findOne.mockResolvedValue(null);
      const created = {
        workerId: 'w-1',
        skillId: 's-1',
        proficiencyLevel: ProficiencyLevel.ADVANCED,
        isVerified: true,
      };
      workerSkillRepo.create.mockReturnValue(created);
      workerSkillRepo.save.mockResolvedValue(created);

      const result = await service.assignSkillToWorker('s-1', {
        workerId: 'w-1',
        proficiencyLevel: ProficiencyLevel.ADVANCED,
      });

      expect(result.proficiencyLevel).toBe(ProficiencyLevel.ADVANCED);
      expect(result.isVerified).toBe(true);
    });
  });

  describe('removeSkillFromWorker', () => {
    it('should remove worker skill assignment', async () => {
      const record = { id: 'ws-1' };
      workerSkillRepo.findOne.mockResolvedValue(record);
      workerSkillRepo.remove.mockResolvedValue(record);

      const result = await service.removeSkillFromWorker('s-1', 'w-1');
      expect(result.message).toContain('removed');
    });

    it('should throw NotFoundException if assignment does not exist', async () => {
      workerSkillRepo.findOne.mockResolvedValue(null);

      await expect(service.removeSkillFromWorker('s-1', 'w-none')).rejects.toThrow(NotFoundException);
    });
  });
});

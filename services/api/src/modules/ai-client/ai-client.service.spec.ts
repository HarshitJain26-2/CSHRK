import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { AIClientService } from './ai-client.service';
import { AIInferenceLogEntity, AIModelVersionEntity } from '../../database/entities';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIClientService', () => {
  let service: AIClientService;
  let inferenceLogRepo: any;
  let modelVersionRepo: any;

  beforeEach(async () => {
    inferenceLogRepo = {
      create: jest.fn((dto) => ({ id: 'log-1', ...dto })),
      save: jest.fn((entity) => Promise.resolve(entity)),
      find: jest.fn().mockResolvedValue([]),
    };

    modelVersionRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIClientService,
        { provide: getRepositoryToken(AIInferenceLogEntity), useValue: inferenceLogRepo },
        { provide: getRepositoryToken(AIModelVersionEntity), useValue: modelVersionRepo },
      ],
    }).compile();

    service = module.get<AIClientService>(AIClientService);
  });

  describe('matchWorkers', () => {
    const mockCandidates = [
      {
        workerId: 'w-1',
        userId: 'u-1',
        fullName: 'Worker One',
        cooperativeName: 'Coop A',
        ratingAvg: 4.8,
        totalJobs: 20,
        distanceKm: 3.5,
        verifiedSkillName: 'Plumber',
        proficiencyLevel: 'INTERMEDIATE' as any,
      },
      {
        workerId: 'w-2',
        userId: 'u-2',
        fullName: 'Worker Two',
        cooperativeName: 'Coop A',
        ratingAvg: 4.9,
        totalJobs: 40,
        distanceKm: 1.2,
        verifiedSkillName: 'Plumber',
        proficiencyLevel: 'EXPERT' as any,
      },
    ];

    it('should return AI ranked candidates with explanations on success', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          service_request_id: 'req-1',
          candidates: [
            {
              worker_id: 'w-2',
              match_score: 0.95,
              distance_km: 1.2,
              skill_fit_score: 1.0,
              reliability_score: 0.98,
              explanations: ['1.2 km away', 'Expert level'],
            },
            {
              worker_id: 'w-1',
              match_score: 0.82,
              distance_km: 3.5,
              skill_fit_score: 0.85,
              reliability_score: 0.9,
              explanations: ['3.5 km away'],
            },
          ],
          algorithm_version: 'cshrk-match-v1.2.0',
        },
      });

      const res = await service.matchWorkers('req-1', ['skill-1'], 28.6, 77.2, 10, mockCandidates);

      expect(res.length).toBe(2);
      expect(res[0].workerId).toBe('w-2');
      expect(res[0].matchScore).toBe(0.95);
      expect(res[0].explanations).toContain('1.2 km away');

      expect(inferenceLogRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          taskType: 'MATCHING',
          fallbackUsed: false,
        }),
      );
    });

    it('should smoothly fall back to deterministic PostGIS ranking when AI service fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Connection refused / timeout'));

      const res = await service.matchWorkers('req-1', ['skill-1'], 28.6, 77.2, 10, mockCandidates);

      expect(res.length).toBe(2);
      // Closer and higher rated worker ranks first in fallback
      expect(res[0].workerId).toBe('w-2');
      expect(res[0].explanations).toBeDefined();
      expect(res[0].explanations?.some((e) => e.includes('Deterministic fallback'))).toBe(true);

      expect(inferenceLogRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          taskType: 'MATCHING',
          fallbackUsed: true,
        }),
      );
    });
  });

  describe('getDemandForecast', () => {
    it('should return forecast and log inference', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          district_code: 'DL-SOUTH',
          category: 'PLUMBING',
          status: 'SUCCESS',
          predictions: [{ date: '2026-09-15', expected_requests: 12 }],
          model_version: 'cshrk-demand-hw-v1.0.0',
        },
      });

      const res = await service.getDemandForecast('DL-SOUTH', 'PLUMBING', 7, []);
      expect(res.status).toBe('SUCCESS');
      expect(inferenceLogRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          taskType: 'FORECASTING',
          fallbackUsed: false,
        }),
      );
    });
  });
});

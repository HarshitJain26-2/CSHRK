import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequestEntity } from '../../database/entities/service-request.entity';
import { ServiceEntity } from '../../database/entities/service.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CustomerService } from '../customer/customer.service';
import { ServiceRequestStatus } from '@cshrk/types';

describe('ServiceRequestService (Phase 2 Unit Tests)', () => {
  let service: ServiceRequestService;
  let requestRepo: any;
  let serviceRepo: any;
  let workerRepo: any;
  let customerService: any;
  let queryBuilder: any;

  beforeEach(async () => {
    requestRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'sr-1', ...entity })),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    serviceRepo = {
      findOne: jest.fn(),
    };

    queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawAndEntities: jest.fn(),
    };

    workerRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    customerService = {
      getProfileByUserId: jest.fn().mockResolvedValue({
        id: 'cust-1',
        userId: 'u-cust',
        address: 'Delhi',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRequestService,
        { provide: getRepositoryToken(ServiceRequestEntity), useValue: requestRepo },
        { provide: getRepositoryToken(ServiceEntity), useValue: serviceRepo },
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
        { provide: CustomerService, useValue: customerService },
      ],
    }).compile();

    service = module.get<ServiceRequestService>(ServiceRequestService);
  });

  describe('createRequest', () => {
    it('should create service request with PostGIS Point coordinates', async () => {
      serviceRepo.findOne.mockResolvedValue({ id: 'serv-1', isActive: true });

      const result = await service.createRequest('u-cust', {
        serviceId: 'serv-1',
        description: 'Leaking water pipe',
        latitude: 28.6328,
        longitude: 77.2167,
        addressText: 'Connaught Place',
      });

      expect(result.id).toBe('sr-1');
      expect(result.location).toEqual({
        type: 'Point',
        coordinates: [77.2167, 28.6328],
      });
      expect(result.status).toBe(ServiceRequestStatus.PENDING);
    });

    it('should throw NotFoundException if service is inactive or missing', async () => {
      serviceRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createRequest('u-cust', {
          serviceId: 'serv-999',
          description: 'Testing',
          latitude: 28.6,
          longitude: 77.2,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRequestById & Authorization', () => {
    it('should return request if customer is owner', async () => {
      requestRepo.findOne.mockResolvedValue({
        id: 'sr-1',
        customer: { userId: 'u-cust' },
      });

      const result = await service.getRequestById('u-cust', 'sr-1');
      expect(result.id).toBe('sr-1');
    });

    it('should throw ForbiddenException if user is not customer owner', async () => {
      requestRepo.findOne.mockResolvedValue({
        id: 'sr-1',
        customer: { userId: 'u-other-customer' },
      });

      await expect(service.getRequestById('u-cust', 'sr-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('discoverCandidates (PostGIS ST_DistanceSphere)', () => {
    it('should query eligible workers and return distance in km', async () => {
      requestRepo.findOne.mockResolvedValue({
        id: 'sr-1',
        customer: { userId: 'u-cust' },
        service: { id: 'serv-1', skillId: 'skill-plumb-1' },
        location: { type: 'Point', coordinates: [77.2167, 28.6328] },
      });

      const mockWorker = {
        id: 'w-1',
        userId: 'u-worker-1',
        fullName: 'Amit Sharma',
        memberId: 'MEM-001',
        ratingAvg: 4.9,
        totalJobs: 25,
        cooperative: { name: 'Delhi Co-op' },
      };

      const mockRaw = {
        distanceKm: '2.45',
        verifiedSkillName: 'Plumbing & Pipefitting',
        proficiencyLevel: 'EXPERT',
      };

      queryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [mockWorker],
        raw: [mockRaw],
      });

      const candidates = await service.discoverCandidates('u-cust', 'sr-1', {
        radiusKm: 25,
      });

      expect(candidates).toHaveLength(1);
      expect(candidates[0].workerId).toBe('w-1');
      expect(candidates[0].distanceKm).toBe(2.45);
      expect(candidates[0].verifiedSkillName).toBe('Plumbing & Pipefitting');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'ST_DistanceSphere(worker."currentLocation", ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))',
        'ASC',
      );
    });
  });
});

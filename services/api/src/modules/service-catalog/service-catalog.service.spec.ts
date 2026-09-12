import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ServiceCatalogService } from './service-catalog.service';
import { ServiceEntity } from '../../database/entities/service.entity';

describe('ServiceCatalogService (Phase 2 Unit Tests)', () => {
  let service: ServiceCatalogService;
  let serviceRepo: any;
  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    serviceRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceCatalogService,
        { provide: getRepositoryToken(ServiceEntity), useValue: serviceRepo },
      ],
    }).compile();

    service = module.get<ServiceCatalogService>(ServiceCatalogService);
  });

  describe('listServices', () => {
    it('should query services with category and search filtering', async () => {
      const mockServices = [
        { id: 's-1', name: 'Plumbing Repair', category: 'Plumbing', basePrice: 450 },
      ];
      queryBuilder.getManyAndCount.mockResolvedValue([mockServices, 1]);

      const result = await service.listServices({
        category: 'Plumbing',
        search: 'leak',
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockServices);
      expect(result.total).toBe(1);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(service.category) = LOWER(:category)',
        { category: 'Plumbing' },
      );
    });
  });

  describe('listCategories', () => {
    it('should aggregate active categories with counts', async () => {
      queryBuilder.getRawMany.mockResolvedValue([
        { name: 'Electrical', count: '4' },
        { name: 'Plumbing', count: '3' },
      ]);

      const result = await service.listCategories();
      expect(result).toEqual([
        { name: 'Electrical', count: 4 },
        { name: 'Plumbing', count: 3 },
      ]);
    });
  });

  describe('getServiceById', () => {
    it('should return service details by ID', async () => {
      const mockService = { id: 's-1', name: 'Plumbing' };
      serviceRepo.findOne.mockResolvedValue(mockService);

      const result = await service.getServiceById('s-1');
      expect(result).toEqual(mockService);
    });

    it('should throw NotFoundException if service does not exist', async () => {
      serviceRepo.findOne.mockResolvedValue(null);

      await expect(service.getServiceById('s-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

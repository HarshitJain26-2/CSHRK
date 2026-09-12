import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { UserEntity } from '../../database/entities/user.entity';

describe('CustomerService (Phase 2 Unit Tests)', () => {
  let service: CustomerService;
  let customerRepo: any;
  let userRepo: any;

  beforeEach(async () => {
    customerRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'c-1', ...entity })),
    };
    userRepo = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: getRepositoryToken(CustomerEntity), useValue: customerRepo },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  describe('getProfileByUserId', () => {
    it('should return existing customer profile', async () => {
      const mockCustomer = { id: 'c-1', userId: 'u-1', fullName: 'Rajesh Kumar' };
      customerRepo.findOne.mockResolvedValue(mockCustomer);

      const result = await service.getProfileByUserId('u-1');
      expect(result).toEqual(mockCustomer);
      expect(customerRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 'u-1' },
        relations: ['user'],
      });
    });

    it('should create customer profile if user exists but profile missing', async () => {
      customerRepo.findOne.mockResolvedValue(null);
      userRepo.findOne.mockResolvedValue({ id: 'u-1', fullName: 'New User' });

      const result = await service.getProfileByUserId('u-1');
      expect(result.fullName).toBe('New User');
      expect(customerRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      customerRepo.findOne.mockResolvedValue(null);
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfileByUserId('u-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update name, phone, address, and coordinates', async () => {
      const mockCustomer = {
        id: 'c-1',
        userId: 'u-1',
        fullName: 'Old Name',
        phone: '+911111111111',
      };
      customerRepo.findOne.mockResolvedValue(mockCustomer);

      const result = await service.updateProfile('u-1', {
        fullName: 'New Name',
        phone: '+919876543210',
        address: 'Connaught Place, Delhi',
        latitude: 28.6328,
        longitude: 77.2167,
      });

      expect(result.fullName).toBe('New Name');
      expect(result.phone).toBe('+919876543210');
      expect(result.address).toBe('Connaught Place, Delhi');
      expect(result.defaultLocation).toEqual({
        type: 'Point',
        coordinates: [77.2167, 28.6328],
      });
      expect(userRepo.update).toHaveBeenCalledWith('u-1', { fullName: 'New Name' });
    });
  });
});

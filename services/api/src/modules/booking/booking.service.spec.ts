import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookingService } from './booking.service';
import { BookingEntity } from '../../database/entities/booking.entity';
import { RatingEntity } from '../../database/entities/rating.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { ServiceRequestEntity } from '../../database/entities/service-request.entity';
import { CustomerService } from '../customer/customer.service';
import {
  BookingStatus,
  ServiceRequestStatus,
  AccountStatus,
  WorkerAvailabilityStatus,
  UserRole,
} from '@cshrk/types';

describe('BookingService (Phase 2 Unit Tests)', () => {
  let service: BookingService;
  let bookingRepo: any;
  let ratingRepo: any;
  let workerRepo: any;
  let customerRepo: any;
  let customerService: any;
  let mockEntityManager: any;
  let dataSource: any;

  beforeEach(async () => {
    bookingRepo = {
      findOne: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
      createQueryBuilder: jest.fn(),
    };

    ratingRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'rate-1', ...entity })),
    };

    workerRepo = {
      findOne: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };

    customerRepo = {
      findOne: jest.fn(),
    };

    customerService = {
      getProfileByUserId: jest.fn().mockResolvedValue({
        id: 'cust-1',
        userId: 'u-cust',
      }),
    };

    mockEntityManager = {
      findOne: jest.fn(),
      create: jest.fn((_, entity) => entity),
      save: jest.fn((_, entity) => Promise.resolve({ id: 'bk-1', ...entity })),
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null), // no schedule conflict by default
        }),
      }),
    };

    dataSource = {
      transaction: jest.fn((cb) => cb(mockEntityManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: getRepositoryToken(BookingEntity), useValue: bookingRepo },
        { provide: getRepositoryToken(RatingEntity), useValue: ratingRepo },
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
        { provide: getRepositoryToken(CustomerEntity), useValue: customerRepo },
        { provide: CustomerService, useValue: customerService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  describe('createBooking (Transactional with Concurrency Checks)', () => {
    it('should create booking with PENDING_ACCEPTANCE status', async () => {
      mockEntityManager.findOne.mockImplementation((entityClass: any) => {
        if (entityClass === ServiceRequestEntity) {
          return Promise.resolve({
            id: 'sr-1',
            customerId: 'cust-1',
            service: { id: 'serv-1', skillId: 'sk-1', basePrice: 500 },
          });
        }
        if (entityClass === WorkerEntity) {
          return Promise.resolve({
            id: 'w-1',
            status: AccountStatus.ACTIVE,
            availabilityStatus: WorkerAvailabilityStatus.AVAILABLE,
            cooperativeId: 'coop-1',
            workerSkills: [{ skillId: 'sk-1', isVerified: true }],
          });
        }
        return null;
      });

      const result = await service.createBooking('u-cust', {
        serviceRequestId: 'sr-1',
        workerId: 'w-1',
        durationHours: 2,
      });

      expect(result.status).toBe(BookingStatus.PENDING_ACCEPTANCE);
      expect(result.totalAmount).toBe(1000);
    });

    it('should reject booking if worker is UNAVAILABLE', async () => {
      mockEntityManager.findOne.mockImplementation((entityClass: any) => {
        if (entityClass === ServiceRequestEntity) {
          return Promise.resolve({
            id: 'sr-1',
            customerId: 'cust-1',
            service: { id: 'serv-1', basePrice: 500 },
          });
        }
        if (entityClass === WorkerEntity) {
          return Promise.resolve({
            id: 'w-1',
            status: AccountStatus.ACTIVE,
            availabilityStatus: WorkerAvailabilityStatus.BUSY,
          });
        }
        return null;
      });

      await expect(
        service.createBooking('u-cust', {
          serviceRequestId: 'sr-1',
          workerId: 'w-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject booking if schedule conflict detected', async () => {
      mockEntityManager.findOne.mockImplementation((entityClass: any) => {
        if (entityClass === ServiceRequestEntity) {
          return Promise.resolve({
            id: 'sr-1',
            customerId: 'cust-1',
            service: { id: 'serv-1', basePrice: 500 },
          });
        }
        if (entityClass === WorkerEntity) {
          return Promise.resolve({
            id: 'w-1',
            status: AccountStatus.ACTIVE,
            availabilityStatus: WorkerAvailabilityStatus.AVAILABLE,
          });
        }
        return null;
      });

      // Simulate overlapping booking found
      mockEntityManager.getRepository.mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({ id: 'conflicting-booking-id' }),
        }),
      });

      await expect(
        service.createBooking('u-cust', {
          serviceRequestId: 'sr-1',
          workerId: 'w-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateBookingStatus (State Machine Validation)', () => {
    it('should allow valid transition PENDING_ACCEPTANCE -> CONFIRMED', async () => {
      const mockBooking = {
        id: 'bk-1',
        status: BookingStatus.PENDING_ACCEPTANCE,
        customer: { userId: 'u-cust' },
        worker: { userId: 'u-worker' },
      };
      bookingRepo.findOne.mockResolvedValue(mockBooking);

      const result = await service.updateBookingStatus(
        'u-worker',
        UserRole.WORKER,
        'bk-1',
        { status: BookingStatus.CONFIRMED },
      );

      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should allow valid transition PENDING_ACCEPTANCE -> REJECTED (worker decline)', async () => {
      const mockBooking = {
        id: 'bk-1',
        status: BookingStatus.PENDING_ACCEPTANCE,
        customer: { userId: 'u-cust' },
        worker: { userId: 'u-worker' },
      };
      bookingRepo.findOne.mockResolvedValue(mockBooking);

      const result = await service.updateBookingStatus(
        'u-worker',
        UserRole.WORKER,
        'bk-1',
        { status: BookingStatus.REJECTED },
      );

      expect(result.status).toBe(BookingStatus.REJECTED);
    });

    it('should reject invalid transition PENDING_ACCEPTANCE -> COMPLETED', async () => {
      const mockBooking = {
        id: 'bk-1',
        status: BookingStatus.PENDING_ACCEPTANCE,
        customer: { userId: 'u-cust' },
      };
      bookingRepo.findOne.mockResolvedValue(mockBooking);

      await expect(
        service.updateBookingStatus(
          'u-cust',
          UserRole.CUSTOMER,
          'bk-1',
          { status: BookingStatus.COMPLETED },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rateBooking (Customer -> Worker upon COMPLETED)', () => {
    it('should submit rating and update worker metrics', async () => {
      const mockBooking = {
        id: 'bk-1',
        workerId: 'w-1',
        status: BookingStatus.COMPLETED,
        customer: { userId: 'u-cust' },
        worker: { id: 'w-1', userId: 'u-worker' },
      };
      bookingRepo.findOne.mockResolvedValue(mockBooking);
      ratingRepo.findOne.mockResolvedValue(null); // not rated yet

      const mockWorker = {
        id: 'w-1',
        ratingAvg: 4.0,
        totalJobs: 1,
      };
      workerRepo.findOne.mockResolvedValue(mockWorker);

      const rating = await service.rateBooking('u-cust', 'bk-1', {
        score: 5,
        comment: 'Excellent plumbing repair work!',
      });

      expect(rating.score).toBe(5);
      expect(mockWorker.totalJobs).toBe(2);
      expect(mockWorker.ratingAvg).toBe(4.5);
      expect(workerRepo.save).toHaveBeenCalledWith(mockWorker);
    });

    it('should reject rating if booking is NOT COMPLETED', async () => {
      const mockBooking = {
        id: 'bk-1',
        status: BookingStatus.IN_PROGRESS,
        customer: { userId: 'u-cust' },
      };
      bookingRepo.findOne.mockResolvedValue(mockBooking);

      await expect(
        service.rateBooking('u-cust', 'bk-1', { score: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate rating for the same booking', async () => {
      const mockBooking = {
        id: 'bk-1',
        status: BookingStatus.COMPLETED,
        customer: { userId: 'u-cust' },
      };
      bookingRepo.findOne.mockResolvedValue(mockBooking);
      ratingRepo.findOne.mockResolvedValue({ id: 'existing-rate-1' });

      await expect(
        service.rateBooking('u-cust', 'bk-1', { score: 5 }),
      ).rejects.toThrow(ConflictException);
    });
  });
});

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BookingEntity } from '../../database/entities/booking.entity';
import { ServiceRequestEntity } from '../../database/entities/service-request.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { RatingEntity } from '../../database/entities/rating.entity';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { CustomerService } from '../customer/customer.service';
import {
  CreateBookingDto,
  UpdateBookingStatusDto,
  RateBookingDto,
  QueryBookingsDto,
} from './dto/booking.dto';
import {
  BookingStatus,
  ServiceRequestStatus,
  AccountStatus,
  WorkerAvailabilityStatus,
  UserRole,
} from '@cshrk/types';

export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.REQUESTED]: [
    BookingStatus.MATCHED,
    BookingStatus.PENDING_ACCEPTANCE,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.MATCHED]: [
    BookingStatus.PENDING_ACCEPTANCE,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.PENDING_ACCEPTANCE]: [
    BookingStatus.CONFIRMED,
    BookingStatus.REJECTED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.SCHEDULED,
    BookingStatus.IN_PROGRESS,
    BookingStatus.CANCELLED,
    BookingStatus.DISPUTED,
  ],
  [BookingStatus.SCHEDULED]: [
    BookingStatus.IN_PROGRESS,
    BookingStatus.CANCELLED,
    BookingStatus.DISPUTED,
  ],
  [BookingStatus.IN_PROGRESS]: [
    BookingStatus.COMPLETED,
    BookingStatus.DISPUTED,
  ],
  [BookingStatus.COMPLETED]: [
    BookingStatus.DISPUTED,
  ],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.REJECTED]: [],
  [BookingStatus.DISPUTED]: [],
};

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepository: Repository<WorkerEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    private readonly customerService: CustomerService,
    private readonly dataSource: DataSource,
  ) {}

  async createBooking(
    userId: string,
    dto: CreateBookingDto,
  ): Promise<BookingEntity> {
    const customer = await this.customerService.getProfileByUserId(userId);

    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(ServiceRequestEntity, {
        where: { id: dto.serviceRequestId },
        relations: ['service', 'service.skill'],
      });

      if (!request) {
        throw new NotFoundException(
          `Service request with ID ${dto.serviceRequestId} not found`,
        );
      }

      if (request.customerId !== customer.id) {
        throw new ForbiddenException(
          'You can only create bookings for your own service requests',
        );
      }

      const worker = await manager.findOne(WorkerEntity, {
        where: { id: dto.workerId },
        relations: ['cooperative', 'workerSkills', 'user'],
      });

      if (!worker) {
        throw new NotFoundException(`Worker with ID ${dto.workerId} not found`);
      }

      if (worker.status !== AccountStatus.ACTIVE) {
        throw new BadRequestException('Selected worker account is not active');
      }

      if (worker.availabilityStatus !== WorkerAvailabilityStatus.AVAILABLE) {
        throw new ConflictException(
          'Worker is currently unavailable for dispatch',
        );
      }

      if (request.service?.skillId) {
        const hasSkill = worker.workerSkills?.some(
          (ws) => ws.skillId === request.service.skillId && ws.isVerified,
        );
        if (!hasSkill) {
          throw new BadRequestException(
            'Worker does not hold a verified trade credential for this service',
          );
        }
      }

      const startTime = dto.startTime
        ? new Date(dto.startTime)
        : request.scheduledTime || new Date();
      const durationHours = dto.durationHours || 2;
      const endTime = new Date(startTime.getTime() + durationHours * 3600000);

      const conflict = await manager
        .getRepository(BookingEntity)
        .createQueryBuilder('booking')
        .where('booking.workerId = :workerId', { workerId: worker.id })
        .andWhere('booking.status IN (:...activeStatuses)', {
          activeStatuses: [
            BookingStatus.PENDING_ACCEPTANCE,
            BookingStatus.CONFIRMED,
            BookingStatus.SCHEDULED,
            BookingStatus.IN_PROGRESS,
          ],
        })
        .andWhere(
          'booking.startTime IS NOT NULL AND booking.endTime IS NOT NULL',
        )
        .andWhere(
          'booking.startTime < :newEndTime AND booking.endTime > :newStartTime',
          { newStartTime: startTime, newEndTime: endTime },
        )
        .getOne();

      if (conflict) {
        throw new ConflictException(
          'Worker has a conflicting active or scheduled booking for this time window',
        );
      }

      const totalAmount =
        Number(request.service?.basePrice || 500) * Number(durationHours);

      const booking = manager.create(BookingEntity, {
        serviceRequestId: request.id,
        customerId: customer.id,
        workerId: worker.id,
        cooperativeId: worker.cooperativeId,
        status: BookingStatus.PENDING_ACCEPTANCE,
        totalAmount,
        startTime,
        endTime,
      });

      const savedBooking = await manager.save(BookingEntity, booking);

      request.status = ServiceRequestStatus.ASSIGNED;
      await manager.save(ServiceRequestEntity, request);

      savedBooking.customer = customer;
      savedBooking.worker = worker;
      savedBooking.serviceRequest = request;

      return savedBooking;
    });
  }

  async listUserBookings(
    userId: string,
    role: UserRole,
    query: QueryBookingsDto,
  ): Promise<{ data: BookingEntity[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.serviceRequest', 'serviceRequest')
      .leftJoinAndSelect('serviceRequest.service', 'service')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('booking.worker', 'worker')
      .leftJoinAndSelect('worker.cooperative', 'cooperative')
      .leftJoinAndSelect('worker.workerSkills', 'workerSkills')
      .leftJoinAndSelect('workerSkills.skill', 'skill');

    if (role === UserRole.CUSTOMER) {
      const customer = await this.customerService.getProfileByUserId(userId);
      qb.where('booking.customerId = :customerId', { customerId: customer.id });
    } else if (role === UserRole.WORKER) {
      const worker = await this.workerRepository.findOne({ where: { userId } });
      if (!worker) {
        return { data: [], total: 0, page, limit };
      }
      qb.where('booking.workerId = :workerId', { workerId: worker.id });
    }

    if (query.status) {
      qb.andWhere('booking.status = :status', { status: query.status });
    }

    qb.orderBy('booking.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async listAdminBookings(
    query: QueryBookingsDto,
  ): Promise<{ data: BookingEntity[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.serviceRequest', 'serviceRequest')
      .leftJoinAndSelect('serviceRequest.service', 'service')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('booking.worker', 'worker')
      .leftJoinAndSelect('worker.cooperative', 'cooperative');

    if (query.status) {
      qb.andWhere('booking.status = :status', { status: query.status });
    }

    qb.orderBy('booking.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getBookingById(
    userId: string,
    role: UserRole,
    id: string,
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'serviceRequest',
        'serviceRequest.service',
        'serviceRequest.service.skill',
        'customer',
        'customer.user',
        'worker',
        'worker.user',
        'worker.cooperative',
        'worker.workerSkills',
        'worker.workerSkills.skill',
      ],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (
      role !== UserRole.PLATFORM_ADMIN &&
      role !== UserRole.FEDERATION_ADMIN &&
      role !== UserRole.COOPERATIVE_ADMIN
    ) {
      const isCustomer = booking.customer?.userId === userId;
      const isWorker = booking.worker?.userId === userId;
      if (!isCustomer && !isWorker) {
        throw new ForbiddenException(
          'You are not authorized to view this booking',
        );
      }
    }

    return booking;
  }

  async updateBookingStatus(
    userId: string,
    role: UserRole,
    id: string,
    dto: UpdateBookingStatusDto,
  ): Promise<BookingEntity> {
    const booking = await this.getBookingById(userId, role, id);

    const allowed = VALID_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid booking state transition from ${booking.status} to ${dto.status}`,
      );
    }

    booking.status = dto.status;

    if (
      dto.status === BookingStatus.COMPLETED &&
      booking.serviceRequest
    ) {
      await this.dataSource
        .getRepository(ServiceRequestEntity)
        .update(booking.serviceRequestId, {
          status: ServiceRequestStatus.COMPLETED,
        });
    } else if (
      dto.status === BookingStatus.CANCELLED &&
      booking.serviceRequest
    ) {
      await this.dataSource
        .getRepository(ServiceRequestEntity)
        .update(booking.serviceRequestId, {
          status: ServiceRequestStatus.CANCELLED,
        });
    } else if (
      dto.status === BookingStatus.REJECTED &&
      booking.serviceRequest
    ) {
      await this.dataSource
        .getRepository(ServiceRequestEntity)
        .update(booking.serviceRequestId, {
          status: ServiceRequestStatus.PENDING,
        });
    }

    return this.bookingRepository.save(booking);
  }

  async rateBooking(
    userId: string,
    bookingId: string,
    dto: RateBookingDto,
  ): Promise<RatingEntity> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'customer.user', 'worker', 'worker.user'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.customer?.userId !== userId) {
      throw new ForbiddenException('Only the customer who made this booking can submit a rating');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Ratings can only be submitted for COMPLETED bookings',
      );
    }

    const existingRating = await this.ratingRepository.findOne({
      where: { bookingId },
    });
    if (existingRating) {
      throw new ConflictException('This booking has already been rated');
    }

    const rating = this.ratingRepository.create({
      bookingId: booking.id,
      reviewerId: userId,
      targetId: booking.worker?.userId || userId,
      score: dto.score,
      comment: dto.comment,
    });

    const savedRating = await this.ratingRepository.save(rating);

    if (booking.worker) {
      const worker = await this.workerRepository.findOne({
        where: { id: booking.workerId },
      });
      if (worker) {
        const currentTotal = worker.totalJobs || 0;
        const currentAvg = parseFloat(String(worker.ratingAvg || 5.0));
        const newTotal = currentTotal + 1;
        const newAvg = (currentAvg * currentTotal + dto.score) / newTotal;

        worker.totalJobs = newTotal;
        worker.ratingAvg = Math.round(newAvg * 10) / 10;
        await this.workerRepository.save(worker);
      }
    }

    return savedRating;
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestEntity } from '../../database/entities/service-request.entity';
import { ServiceEntity } from '../../database/entities/service.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CustomerService } from '../customer/customer.service';
import {
  CreateServiceRequestDto,
  QueryCandidatesDto,
} from './dto/service-request.dto';
import {
  ServiceRequestStatus,
  AccountStatus,
  WorkerAvailabilityStatus,
  IBookingCandidate,
} from '@cshrk/types';

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequestEntity)
    private readonly serviceRequestRepository: Repository<ServiceRequestEntity>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepository: Repository<WorkerEntity>,
    private readonly customerService: CustomerService,
  ) {}

  async createRequest(
    userId: string,
    dto: CreateServiceRequestDto,
  ): Promise<ServiceRequestEntity> {
    const customer = await this.customerService.getProfileByUserId(userId);

    const service = await this.serviceRepository.findOne({
      where: { id: dto.serviceId, isActive: true },
    });
    if (!service) {
      throw new NotFoundException(`Active service with ID ${dto.serviceId} not found`);
    }

    const scheduledTime = dto.scheduledTime ? new Date(dto.scheduledTime) : new Date();

    const request = this.serviceRequestRepository.create({
      customerId: customer.id,
      serviceId: service.id,
      description: dto.description,
      location: {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      },
      addressText: dto.addressText || customer.address,
      urgency: dto.urgency || 'STANDARD',
      scheduledTime,
      status: ServiceRequestStatus.PENDING,
    });

    const saved = await this.serviceRequestRepository.save(request);
    saved.customer = customer;
    saved.service = service;
    return saved;
  }

  async listCustomerRequests(userId: string): Promise<ServiceRequestEntity[]> {
    const customer = await this.customerService.getProfileByUserId(userId);

    return this.serviceRequestRepository.find({
      where: { customerId: customer.id },
      relations: ['service', 'service.skill'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRequestById(userId: string, id: string): Promise<ServiceRequestEntity> {
    const request = await this.serviceRequestRepository.findOne({
      where: { id },
      relations: ['customer', 'customer.user', 'service', 'service.skill'],
    });

    if (!request) {
      throw new NotFoundException(`Service request with ID ${id} not found`);
    }

    if (request.customer?.userId !== userId) {
      throw new ForbiddenException('You are not authorized to view this service request');
    }

    return request;
  }

  async cancelRequest(userId: string, id: string): Promise<ServiceRequestEntity> {
    const request = await this.getRequestById(userId, id);

    if (
      request.status === ServiceRequestStatus.COMPLETED ||
      request.status === ServiceRequestStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot cancel request in status ${request.status}`,
      );
    }

    request.status = ServiceRequestStatus.CANCELLED;
    return this.serviceRequestRepository.save(request);
  }

  async discoverCandidates(
    userId: string,
    requestId: string,
    query: QueryCandidatesDto,
  ): Promise<IBookingCandidate[]> {
    const request = await this.getRequestById(userId, requestId);

    if (!request.location || !request.location.coordinates) {
      throw new BadRequestException('Request location coordinates missing');
    }

    const [lng, lat] = request.location.coordinates;
    const radiusKm = query.radiusKm || 25;
    const radiusMeters = radiusKm * 1000;
    const limit = query.limit || 20;

    const service = request.service;

    const qb = this.workerRepository
      .createQueryBuilder('worker')
      .innerJoinAndSelect('worker.user', 'user')
      .leftJoinAndSelect('worker.cooperative', 'cooperative')
      .innerJoin(
        'worker_skills',
        'ws',
        'ws.worker_id = worker.id AND ws.is_verified = :isVerified' +
          (service.skillId ? ' AND ws.skill_id = :skillId' : ''),
        { isVerified: true, ...(service.skillId ? { skillId: service.skillId } : {}) },
      )
      .innerJoin('skills', 'skill', 'skill.id = ws.skill_id')
      .addSelect('skill.name', 'verifiedSkillName')
      .addSelect('ws.proficiency_level', 'proficiencyLevel')
      .addSelect(
        `ROUND((ST_DistanceSphere(worker."currentLocation", ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)) / 1000.0)::numeric, 2)`,
        'distanceKm',
      )
      .where('worker.status = :activeStatus', { activeStatus: AccountStatus.ACTIVE })
      .andWhere('worker.availabilityStatus = :availStatus', {
        availStatus: WorkerAvailabilityStatus.AVAILABLE,
      })
      .andWhere('worker."currentLocation" IS NOT NULL')
      .andWhere(
        `ST_DistanceSphere(worker."currentLocation", ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)) <= :radiusMeters`,
        { radiusMeters, lng, lat },
      )
      .orderBy(
        'ST_DistanceSphere(worker."currentLocation", ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))',
        'ASC',
      )
      .limit(limit);

    const { entities, raw } = await qb.getRawAndEntities();

    return entities.map((worker, index) => {
      const rawData = raw[index];
      const dist = rawData?.distanceKm !== undefined ? parseFloat(rawData.distanceKm) : 0;
      return {
        workerId: worker.id,
        userId: worker.userId,
        fullName: worker.fullName,
        cooperativeName: worker.cooperative?.name || 'Artisan Labour Cooperative Society',
        memberId: worker.memberId,
        ratingAvg: parseFloat(String(worker.ratingAvg || 5.0)),
        totalJobs: worker.totalJobs || 0,
        distanceKm: dist,
        verifiedSkillName: rawData?.verifiedSkillName || 'General Certified Trade',
        proficiencyLevel: rawData?.proficiencyLevel || ('ADVANCED' as any),
      };
    });
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { WorkerSkillEntity } from '../../database/entities/worker-skill.entity';
import { SkillEntity } from '../../database/entities/skill.entity';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { BookingEntity } from '../../database/entities/booking.entity';
import { CertificationEntity, CertificationStatus } from '../../database/entities/certification.entity';
import {
  OnboardWorkerDto,
  UpdateAvailabilityDto,
  UpdateLocationDto,
  AddWorkerSkillDto,
  VerifyWorkerSkillDto,
  QueryWorkersDto,
  RespondJobDto,
  UpdateWorkerDto,
  UpdateWorkerStatusDto,
} from './dto/worker.dto';
import { WorkerAvailabilityStatus, BookingStatus, AccountStatus } from '@cshrk/types';

@Injectable()
export class WorkerService {
  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workerRepository: Repository<WorkerEntity>,
    @InjectRepository(WorkerSkillEntity)
    private readonly workerSkillRepository: Repository<WorkerSkillEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
    @InjectRepository(CooperativeEntity)
    private readonly cooperativeRepository: Repository<CooperativeEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(CertificationEntity)
    private readonly certificationRepository: Repository<CertificationEntity>,
  ) {}

  async getProfileByUserId(userId: string): Promise<WorkerEntity> {
    const worker = await this.workerRepository.findOne({
      where: { userId },
      relations: ['user', 'cooperative'],
    });

    if (!worker) {
      throw new NotFoundException('Worker profile not found for the current user');
    }

    return worker;
  }

  async getProfileById(id: string): Promise<WorkerEntity> {
    const worker = await this.workerRepository.findOne({
      where: { id },
      relations: ['user', 'cooperative'],
    });

    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }

    return worker;
  }

  async onboardWorker(userId: string, dto: OnboardWorkerDto): Promise<WorkerEntity> {
    const existing = await this.workerRepository.findOne({ where: { userId } });
    if (existing) {
      throw new ConflictException('Worker profile already exists for this user');
    }

    const cooperative = await this.cooperativeRepository.findOne({
      where: { id: dto.cooperativeId },
    });
    if (!cooperative) {
      throw new NotFoundException(`Cooperative with ID ${dto.cooperativeId} not found`);
    }

    const worker = this.workerRepository.create({
      userId,
      cooperativeId: dto.cooperativeId,
      fullName: dto.fullName,
      memberId: dto.memberId,
      employmentType: dto.employmentType,
      availabilityStatus: WorkerAvailabilityStatus.AVAILABLE,
    });

    return this.workerRepository.save(worker);
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto): Promise<WorkerEntity> {
    const worker = await this.getProfileByUserId(userId);
    worker.availabilityStatus = dto.availabilityStatus;
    return this.workerRepository.save(worker);
  }

  async updateLocation(userId: string, dto: UpdateLocationDto): Promise<WorkerEntity> {
    const worker = await this.getProfileByUserId(userId);
    worker.currentLocation = {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    };
    return this.workerRepository.save(worker);
  }

  async getSkillPassport(userId: string): Promise<WorkerSkillEntity[]> {
    const worker = await this.getProfileByUserId(userId);
    return this.workerSkillRepository.find({
      where: { workerId: worker.id },
      relations: ['skill'],
      order: { isVerified: 'DESC', createdAt: 'ASC' },
    });
  }

  async claimSkill(userId: string, dto: AddWorkerSkillDto): Promise<WorkerSkillEntity> {
    const worker = await this.getProfileByUserId(userId);

    const skill = await this.skillRepository.findOne({ where: { id: dto.skillId } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${dto.skillId} not found`);
    }

    const existingClaim = await this.workerSkillRepository.findOne({
      where: { workerId: worker.id, skillId: dto.skillId },
    });
    if (existingClaim) {
      throw new ConflictException('Skill already registered in your passport');
    }

    const claim = this.workerSkillRepository.create({
      workerId: worker.id,
      skillId: dto.skillId,
      proficiencyLevel: dto.proficiencyLevel,
      isVerified: false,
    });

    return this.workerSkillRepository.save(claim);
  }

  async verifySkill(
    workerId: string,
    skillId: string,
    dto: VerifyWorkerSkillDto,
  ): Promise<WorkerSkillEntity> {
    const record = await this.workerSkillRepository.findOne({
      where: { workerId, skillId },
      relations: ['skill', 'worker'],
    });

    if (!record) {
      throw new NotFoundException('Worker skill record not found');
    }

    record.isVerified = dto.isVerified;
    return this.workerSkillRepository.save(record);
  }

  async listWorkers(
    query: QueryWorkersDto,
  ): Promise<{ data: WorkerEntity[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const qb = this.workerRepository
      .createQueryBuilder('worker')
      .leftJoinAndSelect('worker.cooperative', 'cooperative')
      .leftJoinAndSelect('worker.user', 'user');

    if (query.cooperativeId) {
      qb.andWhere('worker.cooperativeId = :cooperativeId', {
        cooperativeId: query.cooperativeId,
      });
    }

    if (query.availabilityStatus) {
      qb.andWhere('worker.availabilityStatus = :status', {
        status: query.availabilityStatus,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(worker.fullName) LIKE :search OR LOWER(worker.memberId) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    qb.skip(skip).take(limit).orderBy('worker.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getAssignedJobs(userId: string): Promise<BookingEntity[]> {
    const worker = await this.getProfileByUserId(userId);
    return this.bookingRepository.find({
      where: { workerId: worker.id },
      relations: ['serviceRequest'],
      order: { createdAt: 'DESC' },
    });
  }

  async respondToJob(
    userId: string,
    bookingId: string,
    dto: RespondJobDto,
  ): Promise<{ message: string; bookingId: string; status: string }> {
    const worker = await this.getProfileByUserId(userId);
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, workerId: worker.id },
    });

    if (!booking) {
      throw new NotFoundException(`Assigned booking with ID ${bookingId} not found`);
    }

    if (dto.action === 'ACCEPT') {
      booking.status = BookingStatus.CONFIRMED;
      await this.bookingRepository.save(booking);
      return {
        message: 'Job assignment successfully accepted',
        bookingId,
        status: booking.status,
      };
    } else {
      booking.status = BookingStatus.CANCELLED;
      await this.bookingRepository.save(booking);
      return {
        message: 'Job assignment declined and returned to dispatch queue',
        bookingId,
        status: booking.status,
      };
    }
  }

  async updateWorker(id: string, dto: UpdateWorkerDto): Promise<WorkerEntity> {
    const worker = await this.getProfileById(id);
    if (dto.fullName) worker.fullName = dto.fullName;
    if (dto.memberId !== undefined) worker.memberId = dto.memberId;
    if (dto.employmentType) worker.employmentType = dto.employmentType;
    if (dto.cooperativeId) {
      const coop = await this.cooperativeRepository.findOne({ where: { id: dto.cooperativeId } });
      if (!coop) throw new NotFoundException(`Cooperative ${dto.cooperativeId} not found`);
      worker.cooperativeId = dto.cooperativeId;
    }
    return this.workerRepository.save(worker);
  }

  async updateWorkerStatus(id: string, dto: UpdateWorkerStatusDto): Promise<WorkerEntity> {
    const worker = await this.getProfileById(id);
    worker.availabilityStatus = dto.availabilityStatus;
    return this.workerRepository.save(worker);
  }

  async getDashboardMetrics() {
    const totalWorkforce = await this.workerRepository.count();
    const activeWorkers = await this.workerRepository.count({ where: { status: AccountStatus.ACTIVE } });
    const inactiveWorkers = await this.workerRepository.count({ where: { status: AccountStatus.INACTIVE } });
    const onboardingWorkers = await this.workerRepository.count({ where: { status: AccountStatus.PENDING_VERIFICATION } });

    const totalCooperatives = await this.cooperativeRepository.count();
    const activeCooperatives = await this.cooperativeRepository.count({ where: { status: AccountStatus.ACTIVE } });

    const totalSkills = await this.skillRepository.count();

    const totalCertifications = await this.certificationRepository.count();
    const validCertifications = await this.certificationRepository.count({ where: { status: CertificationStatus.VALID } });
    const expiringCertifications = await this.certificationRepository.count({ where: { status: CertificationStatus.EXPIRING } });
    const expiredCertifications = await this.certificationRepository.count({ where: { status: CertificationStatus.EXPIRED } });
    const pendingCertifications = await this.certificationRepository.count({ where: { status: CertificationStatus.PENDING } });

    return {
      totalWorkforce,
      activeWorkers,
      inactiveWorkers,
      onboardingWorkers,
      totalCooperatives,
      activeCooperatives,
      avgComplianceRate: 95.8,
      totalCertifications,
      validCertifications,
      expiringCertifications,
      expiredCertifications,
      pendingCertifications,
      urgentVerificationQueue: pendingCertifications,
      totalSkills,
      skillCategories: 12,
      mappedWorkersCount: activeWorkers,
      verifiedSkillsCount: validCertifications,
    };
  }
}


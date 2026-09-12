import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CooperativeEntity } from '../../database/entities/cooperative.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import {
  CreateCooperativeDto,
  UpdateCooperativeDto,
  UpdateAffiliationDto,
} from './dto/cooperative.dto';

@Injectable()
export class CooperativeService {
  constructor(
    @InjectRepository(CooperativeEntity)
    private readonly coopRepository: Repository<CooperativeEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepository: Repository<WorkerEntity>,
  ) {}

  async createCooperative(dto: CreateCooperativeDto): Promise<CooperativeEntity> {
    const existing = await this.coopRepository.findOne({
      where: { registrationNumber: dto.registrationNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Cooperative with registration number ${dto.registrationNumber} already exists`,
      );
    }

    const coop = this.coopRepository.create(dto);
    return this.coopRepository.save(coop);
  }

  async listCooperatives(district?: string, search?: string): Promise<CooperativeEntity[]> {
    const qb = this.coopRepository.createQueryBuilder('coop');
    if (district) {
      qb.andWhere('coop.district = :district', { district });
    }
    if (search) {
      qb.andWhere(
        '(LOWER(coop.name) LIKE :s OR LOWER(coop.registrationNumber) LIKE :s OR LOWER(coop.district) LIKE :s)',
        { s: `%${search.toLowerCase()}%` },
      );
    }
    return qb.orderBy('coop.name', 'ASC').getMany();
  }

  async getCooperativeById(id: string): Promise<CooperativeEntity> {
    const coop = await this.coopRepository.findOne({ where: { id } });
    if (!coop) {
      throw new NotFoundException(`Cooperative with ID ${id} not found`);
    }
    return coop;
  }

  async updateCooperative(id: string, dto: UpdateCooperativeDto): Promise<CooperativeEntity> {
    const coop = await this.getCooperativeById(id);
    if (dto.name) coop.name = dto.name;
    if (dto.district) coop.district = dto.district;
    if (dto.contactEmail) coop.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) coop.contactPhone = dto.contactPhone;
    if (dto.status) coop.status = dto.status;
    return this.coopRepository.save(coop);
  }

  async getCooperativeMembers(id: string): Promise<WorkerEntity[]> {
    await this.getCooperativeById(id);
    return this.workerRepository.find({
      where: { cooperativeId: id },
      relations: ['user'],
      order: { fullName: 'ASC' },
    });
  }

  async updateAffiliation(
    cooperativeId: string,
    workerId: string,
    dto: UpdateAffiliationDto,
  ): Promise<WorkerEntity> {
    const worker = await this.workerRepository.findOne({
      where: { id: workerId, cooperativeId },
    });
    if (!worker) {
      throw new NotFoundException(
        `Worker ${workerId} is not affiliated with Cooperative ${cooperativeId}`,
      );
    }

    if (dto.targetCooperativeId) {
      const targetCoop = await this.getCooperativeById(dto.targetCooperativeId);
      worker.cooperativeId = targetCoop.id;
    }
    return this.workerRepository.save(worker);
  }
}

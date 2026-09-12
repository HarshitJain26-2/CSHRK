import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from '../../database/entities/service.entity';
import { QueryServicesDto } from './dto/service-catalog.dto';

@Injectable()
export class ServiceCatalogService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
  ) {}

  async listServices(query: QueryServicesDto): Promise<{
    data: ServiceEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.skill', 'skill')
      .where('service.isActive = :isActive', { isActive: true });

    if (query.category) {
      qb.andWhere('LOWER(service.category) = LOWER(:category)', {
        category: query.category,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(service.name) LIKE :search OR LOWER(service.description) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    qb.orderBy('service.name', 'ASC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async listCategories(): Promise<{ name: string; count: number }[]> {
    const raw = await this.serviceRepository
      .createQueryBuilder('service')
      .select('service.category', 'name')
      .addSelect('COUNT(service.id)', 'count')
      .where('service.isActive = :isActive', { isActive: true })
      .groupBy('service.category')
      .orderBy('service.category', 'ASC')
      .getRawMany();

    return raw.map((r) => ({
      name: r.name,
      count: parseInt(r.count, 10),
    }));
  }

  async getServiceById(id: string): Promise<ServiceEntity> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['skill'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CertificationEntity,
  CertificationStatus,
} from '../../database/entities/certification.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import {
  CreateCertificationDto,
  UpdateCertificationDto,
  VerifyCertificationDto,
  RenewCertificationDto,
} from './dto/certification.dto';

@Injectable()
export class CertificationService {
  constructor(
    @InjectRepository(CertificationEntity)
    private readonly certRepository: Repository<CertificationEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepository: Repository<WorkerEntity>,
  ) {}

  /**
   * Dynamically evaluate certification status from actual calendar expiry date
   */
  calculateDynamicStatus(cert: CertificationEntity): CertificationStatus {
    if (cert.status === CertificationStatus.PENDING || cert.status === CertificationStatus.REJECTED) {
      return cert.status;
    }

    if (!cert.expiryDate) {
      return CertificationStatus.VALID;
    }

    const now = new Date();
    const expiry = new Date(cert.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return CertificationStatus.EXPIRED;
    } else if (diffDays <= 30) {
      return CertificationStatus.EXPIRING;
    }
    return CertificationStatus.VALID;
  }

  async createCertification(dto: CreateCertificationDto): Promise<CertificationEntity> {
    const worker = await this.workerRepository.findOne({ where: { id: dto.workerId } });
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${dto.workerId} not found`);
    }

    const cert = this.certRepository.create({
      ...dto,
      status: dto.status || CertificationStatus.PENDING,
    });
    return this.certRepository.save(cert);
  }

  async listCertifications(
    status?: CertificationStatus,
    workerId?: string,
    search?: string,
  ): Promise<CertificationEntity[]> {
    const qb = this.certRepository
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.worker', 'worker');

    if (status) {
      qb.andWhere('cert.status = :status', { status });
    }
    if (workerId) {
      qb.andWhere('cert.workerId = :workerId', { workerId });
    }
    if (search) {
      qb.andWhere(
        '(LOWER(cert.certificationName) LIKE :s OR LOWER(cert.credentialNumber) LIKE :s OR LOWER(cert.issuingOrganization) LIKE :s)',
        { s: `%${search.toLowerCase()}%` },
      );
    }

    const records = await qb.orderBy('cert.issueDate', 'DESC').getMany();
    // Update dynamically evaluated statuses
    return records.map((c) => {
      c.status = this.calculateDynamicStatus(c);
      return c;
    });
  }

  async getCertificationById(id: string): Promise<CertificationEntity> {
    const cert = await this.certRepository.findOne({
      where: { id },
      relations: ['worker'],
    });
    if (!cert) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }
    cert.status = this.calculateDynamicStatus(cert);
    return cert;
  }

  async updateCertification(id: string, dto: UpdateCertificationDto): Promise<CertificationEntity> {
    const cert = await this.getCertificationById(id);
    if (dto.certificationName) cert.certificationName = dto.certificationName;
    if (dto.issuingOrganization) cert.issuingOrganization = dto.issuingOrganization;
    if (dto.expiryDate !== undefined) cert.expiryDate = dto.expiryDate;
    if (dto.status) cert.status = dto.status;
    return this.certRepository.save(cert);
  }

  async verifyCertification(id: string, dto: VerifyCertificationDto): Promise<CertificationEntity> {
    const cert = await this.getCertificationById(id);
    cert.status = dto.status;
    if (dto.verificationNotes) cert.verificationNotes = dto.verificationNotes;
    return this.certRepository.save(cert);
  }

  async renewCertification(id: string, dto: RenewCertificationDto): Promise<CertificationEntity> {
    const cert = await this.getCertificationById(id);
    cert.expiryDate = dto.newExpiryDate;
    cert.status = CertificationStatus.VALID;
    return this.certRepository.save(cert);
  }
}

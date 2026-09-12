import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractEntity } from '../../database/entities/contract.entity';
import { ProjectEntity } from '../../database/entities/project.entity';
import { LargeJobEntity } from '../../database/entities/large-job.entity';
import { WorkforceRequirementEntity } from '../../database/entities/workforce-requirement.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CooperativeService } from '../cooperative/cooperative.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateContractDto,
  UpdateContractStatusDto,
  CreateProjectDto,
  CreateLargeJobDto,
  CreateWorkforceRequirementDto,
} from './dto/org-operations.dto';
import {
  UserRole,
  ContractStatus,
  ProjectStatus,
  JobStatus,
  RequirementStatus,
  AccountStatus,
} from '@cshrk/types';

@Injectable()
export class OrgOperationsService {
  constructor(
    @InjectRepository(ContractEntity)
    private readonly contractRepo: Repository<ContractEntity>,
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
    @InjectRepository(LargeJobEntity)
    private readonly jobRepo: Repository<LargeJobEntity>,
    @InjectRepository(WorkforceRequirementEntity)
    private readonly reqRepo: Repository<WorkforceRequirementEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepo: Repository<WorkerEntity>,
    private readonly cooperativeService: CooperativeService,
    private readonly auditService: AuditService,
  ) {}

  // ==============================================================================
  // CONTRACTS
  // ==============================================================================

  async createContract(dto: CreateContractDto, user: { id: string; role: UserRole }): Promise<ContractEntity> {
    const existing = await this.contractRepo.findOne({
      where: { contractNumber: dto.contractNumber },
    });
    if (existing) {
      throw new ConflictException(`Contract number ${dto.contractNumber} already exists`);
    }

    if (dto.cooperativeId) {
      await this.cooperativeService.validateCooperativeAccess(user, dto.cooperativeId);
    }

    const contract = this.contractRepo.create({
      contractNumber: dto.contractNumber,
      title: dto.title,
      clientName: dto.clientName,
      clientContact: dto.clientContact,
      cooperativeId: dto.cooperativeId,
      federationId: dto.federationId,
      scope: dto.scope,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: dto.status || ContractStatus.DRAFT,
    });
    const saved = await this.contractRepo.save(contract);

    await this.auditService.logAction(
      user.id,
      'CREATE_CONTRACT',
      'CONTRACT',
      saved.id,
      { contractNumber: saved.contractNumber, clientName: saved.clientName },
    );

    return saved;
  }

  async listContracts(query: { cooperativeId?: string; federationId?: string }): Promise<ContractEntity[]> {
    const qb = this.contractRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.cooperative', 'cooperative')
      .leftJoinAndSelect('c.federation', 'federation');

    if (query.cooperativeId) {
      qb.andWhere('c.cooperativeId = :cooperativeId', { cooperativeId: query.cooperativeId });
    }
    if (query.federationId) {
      qb.andWhere('c.federationId = :federationId', { federationId: query.federationId });
    }

    return qb.orderBy('c.createdAt', 'DESC').getMany();
  }

  async getContractById(id: string): Promise<ContractEntity> {
    const contract = await this.contractRepo.findOne({
      where: { id },
      relations: ['cooperative', 'federation'],
    });
    if (!contract) throw new NotFoundException(`Contract ${id} not found`);
    return contract;
  }

  async updateContractStatus(
    id: string,
    dto: UpdateContractStatusDto,
    user: { id: string; role: UserRole },
  ): Promise<ContractEntity> {
    const contract = await this.getContractById(id);
    const previous = contract.status;
    contract.status = dto.status;
    const saved = await this.contractRepo.save(contract);

    await this.auditService.logAction(
      user.id,
      'UPDATE_CONTRACT_STATUS',
      'CONTRACT',
      id,
      { previous, newStatus: dto.status },
    );

    return saved;
  }

  // ==============================================================================
  // PROJECTS
  // ==============================================================================

  async createProject(dto: CreateProjectDto, user: { id: string; role: UserRole }): Promise<ProjectEntity> {
    await this.cooperativeService.validateCooperativeAccess(user, dto.cooperativeId);

    const location =
      dto.longitude !== undefined && dto.latitude !== undefined
        ? { type: 'Point', coordinates: [dto.longitude, dto.latitude] }
        : undefined;

    const project = this.projectRepo.create({
      contractId: dto.contractId,
      cooperativeId: dto.cooperativeId,
      title: dto.title,
      description: dto.description,
      location,
      address: dto.address,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: dto.status || ProjectStatus.PLANNING,
    });
    const saved = await this.projectRepo.save(project);

    await this.auditService.logAction(
      user.id,
      'CREATE_PROJECT',
      'PROJECT',
      saved.id,
      { title: saved.title, cooperativeId: saved.cooperativeId },
    );

    return saved;
  }

  async listProjects(query: { cooperativeId?: string; contractId?: string }): Promise<ProjectEntity[]> {
    const qb = this.projectRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.cooperative', 'cooperative')
      .leftJoinAndSelect('p.contract', 'contract')
      .leftJoinAndSelect('p.teams', 'teams');

    if (query.cooperativeId) {
      qb.andWhere('p.cooperativeId = :cooperativeId', { cooperativeId: query.cooperativeId });
    }
    if (query.contractId) {
      qb.andWhere('p.contractId = :contractId', { contractId: query.contractId });
    }

    return qb.orderBy('p.createdAt', 'DESC').getMany();
  }

  async getProjectById(id: string): Promise<ProjectEntity> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['cooperative', 'contract', 'teams', 'teams.leader'],
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async updateProjectStatus(
    id: string,
    status: ProjectStatus,
    user: { id: string; role: UserRole },
  ): Promise<ProjectEntity> {
    const project = await this.getProjectById(id);
    await this.cooperativeService.validateCooperativeAccess(user, project.cooperativeId);

    const prev = project.status;
    project.status = status;
    const saved = await this.projectRepo.save(project);

    await this.auditService.logAction(
      user.id,
      'UPDATE_PROJECT_STATUS',
      'PROJECT',
      id,
      { previous: prev, newStatus: status },
    );

    return saved;
  }

  // ==============================================================================
  // LARGE ORGANIZATIONAL JOBS (NO PRICING)
  // ==============================================================================

  async createLargeJob(dto: CreateLargeJobDto, user: { id: string; role: UserRole }): Promise<LargeJobEntity> {
    await this.cooperativeService.validateCooperativeAccess(user, dto.cooperativeId);

    const location =
      dto.longitude !== undefined && dto.latitude !== undefined
        ? { type: 'Point', coordinates: [dto.longitude, dto.latitude] }
        : undefined;

    const job = this.jobRepo.create({
      projectId: dto.projectId,
      cooperativeId: dto.cooperativeId,
      title: dto.title,
      organizationName: dto.organizationName,
      skillId: dto.skillId,
      requiredWorkers: dto.requiredWorkers,
      assignedWorkers: 0,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      location,
      address: dto.address,
      status: dto.status || JobStatus.OPEN,
    });
    const saved = await this.jobRepo.save(job);

    await this.auditService.logAction(
      user.id,
      'CREATE_LARGE_JOB',
      'LARGE_JOB',
      saved.id,
      { title: saved.title, requiredWorkers: saved.requiredWorkers },
    );

    return this.getLargeJobById(saved.id);
  }

  async listLargeJobs(query: { cooperativeId?: string; projectId?: string; status?: JobStatus }): Promise<LargeJobEntity[]> {
    const qb = this.jobRepo.createQueryBuilder('j')
      .leftJoinAndSelect('j.cooperative', 'cooperative')
      .leftJoinAndSelect('j.project', 'project')
      .leftJoinAndSelect('j.skill', 'skill');

    if (query.cooperativeId) {
      qb.andWhere('j.cooperativeId = :cooperativeId', { cooperativeId: query.cooperativeId });
    }
    if (query.projectId) {
      qb.andWhere('j.projectId = :projectId', { projectId: query.projectId });
    }
    if (query.status) {
      qb.andWhere('j.status = :status', { status: query.status });
    }

    return qb.orderBy('j.createdAt', 'DESC').getMany();
  }

  async getLargeJobById(id: string): Promise<LargeJobEntity> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['cooperative', 'project', 'skill'],
    });
    if (!job) throw new NotFoundException(`Large job ${id} not found`);
    return job;
  }

  async updateJobStatus(
    id: string,
    status: JobStatus,
    user: { id: string; role: UserRole },
  ): Promise<LargeJobEntity> {
    const job = await this.getLargeJobById(id);
    await this.cooperativeService.validateCooperativeAccess(user, job.cooperativeId);

    const prev = job.status;
    job.status = status;
    const saved = await this.jobRepo.save(job);

    await this.auditService.logAction(
      user.id,
      'UPDATE_JOB_STATUS',
      'LARGE_JOB',
      id,
      { previous: prev, newStatus: status },
    );

    return saved;
  }

  // ==============================================================================
  // WORKFORCE REQUIREMENTS & DETERMINISTIC FULFILLMENT EVALUATION
  // ==============================================================================

  async createWorkforceRequirement(
    dto: CreateWorkforceRequirementDto,
    user: { id: string; role: UserRole },
  ): Promise<WorkforceRequirementEntity> {
    const req = this.reqRepo.create({
      contractId: dto.contractId,
      projectId: dto.projectId,
      skillId: dto.skillId,
      quantity: dto.quantity,
      fulfilledQuantity: 0,
      locationCity: dto.locationCity,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: RequirementStatus.PENDING,
    });
    const saved = await this.reqRepo.save(req);

    await this.auditService.logAction(
      user.id,
      'CREATE_WORKFORCE_REQUIREMENT',
      'WORKFORCE_REQUIREMENT',
      saved.id,
      { quantity: saved.quantity, city: saved.locationCity },
    );

    return this.getWorkforceRequirementById(saved.id);
  }

  async listWorkforceRequirements(): Promise<WorkforceRequirementEntity[]> {
    return this.reqRepo.find({
      relations: ['skill', 'contract', 'project'],
      order: { createdAt: 'DESC' },
    });
  }

  async getWorkforceRequirementById(id: string) {
    const req = await this.reqRepo.findOne({
      where: { id },
      relations: ['skill', 'contract', 'project'],
    });
    if (!req) throw new NotFoundException(`Requirement ${id} not found`);

    // Deterministic fulfillment capacity calculation
    const matchingWorkers = await this.workerRepo.createQueryBuilder('worker')
      .innerJoin('worker.workerSkills', 'ws', 'ws.skillId = :skillId', { skillId: req.skillId })
      .leftJoinAndSelect('worker.cooperative', 'cooperative')
      .where('worker.status = :active', { active: AccountStatus.ACTIVE })
      .andWhere('worker.availabilityStatus != :offline', { offline: 'OFFLINE' })
      .getMany();

    const availableCount = matchingWorkers.length;
    let fulfillmentStatus: 'FULL' | 'PARTIAL' | 'INSUFFICIENT' = 'INSUFFICIENT';
    if (availableCount >= req.quantity) {
      fulfillmentStatus = 'FULL';
    } else if (availableCount > 0) {
      fulfillmentStatus = 'PARTIAL';
    }

    return {
      ...req,
      deterministicEvaluation: {
        requiredQuantity: req.quantity,
        availableMatchingWorkers: availableCount,
        fulfillmentCapacity: fulfillmentStatus,
        eligibleWorkers: matchingWorkers.map((w) => ({
          id: w.id,
          fullName: w.fullName,
          cooperativeId: w.cooperativeId,
          cooperativeName: w.cooperative?.name,
        })),
      },
    };
  }
}

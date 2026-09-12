import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillEntity } from '../../database/entities/skill.entity';
import { WorkerSkillEntity } from '../../database/entities/worker-skill.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CreateSkillDto, UpdateSkillDto, AssignSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
    @InjectRepository(WorkerSkillEntity)
    private readonly workerSkillRepository: Repository<WorkerSkillEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepository: Repository<WorkerEntity>,
  ) {}

  async createSkill(dto: CreateSkillDto): Promise<SkillEntity> {
    const existing = await this.skillRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Skill with code ${dto.code} already exists`);
    }

    const skill = this.skillRepository.create(dto);
    return this.skillRepository.save(skill);
  }

  async listSkills(category?: string, search?: string): Promise<SkillEntity[]> {
    const qb = this.skillRepository.createQueryBuilder('skill');
    if (category) {
      qb.andWhere('skill.category = :category', { category });
    }
    if (search) {
      qb.andWhere('(LOWER(skill.name) LIKE :s OR LOWER(skill.code) LIKE :s)', {
        s: `%${search.toLowerCase()}%`,
      });
    }
    return qb.orderBy('skill.name', 'ASC').getMany();
  }

  async getSkillById(id: string): Promise<SkillEntity> {
    const skill = await this.skillRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async updateSkill(id: string, dto: UpdateSkillDto): Promise<SkillEntity> {
    const skill = await this.getSkillById(id);
    if (dto.name) skill.name = dto.name;
    if (dto.category) skill.category = dto.category;
    if (dto.description !== undefined) skill.description = dto.description;
    return this.skillRepository.save(skill);
  }

  async deleteSkill(id: string): Promise<{ message: string }> {
    const skill = await this.getSkillById(id);
    await this.skillRepository.remove(skill);
    return { message: `Skill ${id} successfully removed` };
  }

  async assignSkillToWorker(skillId: string, dto: AssignSkillDto): Promise<WorkerSkillEntity> {
    const skill = await this.getSkillById(skillId);
    const worker = await this.workerRepository.findOne({ where: { id: dto.workerId } });
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${dto.workerId} not found`);
    }

    let record = await this.workerSkillRepository.findOne({
      where: { workerId: dto.workerId, skillId },
    });

    if (record) {
      record.proficiencyLevel = dto.proficiencyLevel;
      return this.workerSkillRepository.save(record);
    }

    record = this.workerSkillRepository.create({
      workerId: dto.workerId,
      skillId,
      proficiencyLevel: dto.proficiencyLevel,
      isVerified: true,
    });
    return this.workerSkillRepository.save(record);
  }

  async removeSkillFromWorker(skillId: string, workerId: string): Promise<{ message: string }> {
    const record = await this.workerSkillRepository.findOne({
      where: { workerId, skillId },
    });
    if (!record) {
      throw new NotFoundException('Worker skill assignment not found');
    }
    await this.workerSkillRepository.remove(record);
    return { message: 'Skill assignment removed successfully' };
  }
}

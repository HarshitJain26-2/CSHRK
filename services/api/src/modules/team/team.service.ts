import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkerTeamEntity } from '../../database/entities/worker-team.entity';
import { TeamMemberEntity } from '../../database/entities/team-member.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';
import { CooperativeService } from '../cooperative/cooperative.service';
import { AuditService } from '../audit/audit.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto/team.dto';
import { UserRole, TeamMemberRole, TeamStatus } from '@cshrk/types';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(WorkerTeamEntity)
    private readonly teamRepo: Repository<WorkerTeamEntity>,
    @InjectRepository(TeamMemberEntity)
    private readonly memberRepo: Repository<TeamMemberEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepo: Repository<WorkerEntity>,
    private readonly cooperativeService: CooperativeService,
    private readonly auditService: AuditService,
  ) {}

  async createTeam(dto: CreateTeamDto, user: { id: string; role: UserRole }): Promise<WorkerTeamEntity> {
    await this.cooperativeService.validateCooperativeAccess(user, dto.cooperativeId);

    if (dto.leaderWorkerId) {
      const leader = await this.workerRepo.findOne({
        where: { id: dto.leaderWorkerId, cooperativeId: dto.cooperativeId },
      });
      if (!leader) {
        throw new NotFoundException('Leader worker not found in this cooperative');
      }
    }

    const team = this.teamRepo.create({
      cooperativeId: dto.cooperativeId,
      name: dto.name,
      description: dto.description,
      leaderWorkerId: dto.leaderWorkerId,
      projectId: dto.projectId,
      status: TeamStatus.ACTIVE,
    });
    const saved = await this.teamRepo.save(team);

    // If leader specified, automatically add as LEADER member
    if (dto.leaderWorkerId) {
      await this.memberRepo.save(
        this.memberRepo.create({
          teamId: saved.id,
          workerId: dto.leaderWorkerId,
          role: TeamMemberRole.LEADER,
        }),
      );
    }

    await this.auditService.logAction(
      user.id,
      'CREATE_WORKER_TEAM',
      'WORKER_TEAM',
      saved.id,
      { name: saved.name, cooperativeId: saved.cooperativeId },
    );

    return this.getTeamById(saved.id, user);
  }

  async listTeams(cooperativeId: string, user: { id: string; role: UserRole }): Promise<WorkerTeamEntity[]> {
    await this.cooperativeService.validateCooperativeAccess(user, cooperativeId);

    return this.teamRepo.find({
      where: { cooperativeId },
      relations: [
        'leader',
        'members',
        'members.worker',
        'members.worker.workerSkills',
        'members.worker.workerSkills.skill',
      ],
      order: { name: 'ASC' },
    });
  }

  async getTeamById(id: string, user: { id: string; role: UserRole }): Promise<WorkerTeamEntity> {
    const team = await this.teamRepo.findOne({
      where: { id },
      relations: [
        'leader',
        'cooperative',
        'members',
        'members.worker',
        'members.worker.workerSkills',
        'members.worker.workerSkills.skill',
      ],
    });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    await this.cooperativeService.validateCooperativeAccess(user, team.cooperativeId);
    return team;
  }

  async updateTeam(
    id: string,
    dto: UpdateTeamDto,
    user: { id: string; role: UserRole },
  ): Promise<WorkerTeamEntity> {
    const team = await this.getTeamById(id, user);

    if (dto.name) team.name = dto.name;
    if (dto.description !== undefined) team.description = dto.description;
    if (dto.status) team.status = dto.status;
    if (dto.projectId !== undefined) team.projectId = dto.projectId;

    if (dto.leaderWorkerId !== undefined) {
      if (dto.leaderWorkerId) {
        const leader = await this.workerRepo.findOne({
          where: { id: dto.leaderWorkerId, cooperativeId: team.cooperativeId },
        });
        if (!leader) throw new NotFoundException('Leader worker not found');
        team.leaderWorkerId = dto.leaderWorkerId;

        // Ensure leader is in members
        const existingMember = await this.memberRepo.findOne({
          where: { teamId: id, workerId: dto.leaderWorkerId },
        });
        if (existingMember) {
          existingMember.role = TeamMemberRole.LEADER;
          await this.memberRepo.save(existingMember);
        } else {
          await this.memberRepo.save(
            this.memberRepo.create({
              teamId: id,
              workerId: dto.leaderWorkerId,
              role: TeamMemberRole.LEADER,
            }),
          );
        }
      } else {
        team.leaderWorkerId = undefined;
      }
    }

    const saved = await this.teamRepo.save(team);

    await this.auditService.logAction(
      user.id,
      'UPDATE_WORKER_TEAM',
      'WORKER_TEAM',
      saved.id,
      dto,
    );

    return this.getTeamById(saved.id, user);
  }

  async addTeamMember(
    teamId: string,
    dto: AddTeamMemberDto,
    user: { id: string; role: UserRole },
  ): Promise<TeamMemberEntity> {
    const team = await this.getTeamById(teamId, user);

    const worker = await this.workerRepo.findOne({
      where: { id: dto.workerId, cooperativeId: team.cooperativeId },
    });
    if (!worker) {
      throw new NotFoundException('Worker is not affiliated with this cooperative');
    }

    const existing = await this.memberRepo.findOne({
      where: { teamId, workerId: dto.workerId },
    });
    if (existing) {
      throw new ConflictException('Worker is already a member of this team');
    }

    const member = this.memberRepo.create({
      teamId,
      workerId: dto.workerId,
      role: dto.role || TeamMemberRole.MEMBER,
    });
    const saved = await this.memberRepo.save(member);

    await this.auditService.logAction(
      user.id,
      'ADD_TEAM_MEMBER',
      'WORKER_TEAM',
      teamId,
      { workerId: dto.workerId, role: member.role },
    );

    return saved;
  }

  async removeTeamMember(
    teamId: string,
    workerId: string,
    user: { id: string; role: UserRole },
  ): Promise<void> {
    const team = await this.getTeamById(teamId, user);

    const member = await this.memberRepo.findOne({
      where: { teamId, workerId },
    });
    if (!member) {
      throw new NotFoundException('Worker is not in this team');
    }

    await this.memberRepo.remove(member);

    if (team.leaderWorkerId === workerId) {
      team.leaderWorkerId = undefined;
      await this.teamRepo.save(team);
    }

    await this.auditService.logAction(
      user.id,
      'REMOVE_TEAM_MEMBER',
      'WORKER_TEAM',
      teamId,
      { workerId },
    );
  }
}

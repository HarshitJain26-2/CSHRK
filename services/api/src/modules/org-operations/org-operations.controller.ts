import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrgOperationsService } from './org-operations.service';
import {
  CreateContractDto,
  UpdateContractStatusDto,
  CreateProjectDto,
  CreateLargeJobDto,
  CreateWorkforceRequirementDto,
} from './dto/org-operations.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, ProjectStatus, JobStatus } from '@cshrk/types';

@ApiTags('Organizational Operations (Contracts, Projects, Jobs, Requirements)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class OrgOperationsController {
  constructor(private readonly orgService: OrgOperationsService) {}

  // --------------------------------------------------------------------------
  // CONTRACTS
  // --------------------------------------------------------------------------
  @Post('contracts')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create formal workforce contract' })
  @ApiResponse({ status: 201, description: 'Contract created' })
  async createContract(@Body() dto: CreateContractDto, @Request() req: any) {
    return this.orgService.createContract(dto, req.user);
  }

  @Get('contracts')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List contracts' })
  @ApiResponse({ status: 200, description: 'Contracts retrieved' })
  async listContracts(
    @Query('cooperativeId') cooperativeId?: string,
    @Query('federationId') federationId?: string,
  ) {
    return this.orgService.listContracts({ cooperativeId, federationId });
  }

  @Get('contracts/:id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get contract details' })
  @ApiResponse({ status: 200, description: 'Contract details' })
  async getContractById(@Param('id') id: string) {
    return this.orgService.getContractById(id);
  }

  @Patch('contracts/:id/status')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update contract lifecycle status' })
  @ApiResponse({ status: 200, description: 'Contract status updated' })
  async updateContractStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContractStatusDto,
    @Request() req: any,
  ) {
    return this.orgService.updateContractStatus(id, dto, req.user);
  }

  // --------------------------------------------------------------------------
  // PROJECTS
  // --------------------------------------------------------------------------
  @Post('projects')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create structured multi-trade project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async createProject(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.orgService.createProject(dto, req.user);
  }

  @Get('projects')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved' })
  async listProjects(
    @Query('cooperativeId') cooperativeId?: string,
    @Query('contractId') contractId?: string,
  ) {
    return this.orgService.listProjects({ cooperativeId, contractId });
  }

  @Get('projects/:id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get project details' })
  @ApiResponse({ status: 200, description: 'Project details' })
  async getProjectById(@Param('id') id: string) {
    return this.orgService.getProjectById(id);
  }

  @Patch('projects/:id/status')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update project lifecycle status' })
  @ApiResponse({ status: 200, description: 'Project status updated' })
  async updateProjectStatus(
    @Param('id') id: string,
    @Body() body: { status: ProjectStatus },
    @Request() req: any,
  ) {
    return this.orgService.updateProjectStatus(id, body.status, req.user);
  }

  // --------------------------------------------------------------------------
  // LARGE ORGANIZATIONAL JOBS
  // --------------------------------------------------------------------------
  @Post('jobs')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create large organizational job (No pricing fields)' })
  @ApiResponse({ status: 201, description: 'Large job created' })
  async createLargeJob(@Body() dto: CreateLargeJobDto, @Request() req: any) {
    return this.orgService.createLargeJob(dto, req.user);
  }

  @Get('jobs')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List large organizational jobs' })
  @ApiResponse({ status: 200, description: 'Large jobs retrieved' })
  async listLargeJobs(
    @Query('cooperativeId') cooperativeId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: JobStatus,
  ) {
    return this.orgService.listLargeJobs({ cooperativeId, projectId, status });
  }

  @Get('jobs/:id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get large job details' })
  @ApiResponse({ status: 200, description: 'Large job details' })
  async getLargeJobById(@Param('id') id: string) {
    return this.orgService.getLargeJobById(id);
  }

  @Patch('jobs/:id/status')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update large job status' })
  @ApiResponse({ status: 200, description: 'Job status updated' })
  async updateJobStatus(
    @Param('id') id: string,
    @Body() body: { status: JobStatus },
    @Request() req: any,
  ) {
    return this.orgService.updateJobStatus(id, body.status, req.user);
  }

  // --------------------------------------------------------------------------
  // WORKFORCE REQUIREMENTS
  // --------------------------------------------------------------------------
  @Post('workforce-requirements')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create multi-worker organizational demand requirement' })
  @ApiResponse({ status: 201, description: 'Workforce requirement created' })
  async createRequirement(@Body() dto: CreateWorkforceRequirementDto, @Request() req: any) {
    return this.orgService.createWorkforceRequirement(dto, req.user);
  }

  @Get('workforce-requirements')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List workforce requirements' })
  @ApiResponse({ status: 200, description: 'Requirements retrieved' })
  async listRequirements() {
    return this.orgService.listWorkforceRequirements();
  }

  @Get('workforce-requirements/:id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get requirement with deterministic fulfillment capacity evaluation' })
  @ApiResponse({ status: 200, description: 'Requirement details with evaluation' })
  async getRequirementById(@Param('id') id: string) {
    return this.orgService.getWorkforceRequirementById(id);
  }
}

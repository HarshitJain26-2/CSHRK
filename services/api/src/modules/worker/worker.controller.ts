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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkerService } from './worker.service';
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';

@ApiTags('Workers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Get('me')
  @Roles(UserRole.WORKER)
  @ApiOperation({ summary: 'Get current authenticated worker profile & cooperative linkage' })
  @SwaggerResponse({ status: 200, description: 'Worker profile retrieved successfully' })
  async getMyProfile(@Request() req: any) {
    return this.workerService.getProfileByUserId(req.user.id);
  }

  @Post('onboard')
  @Roles(UserRole.WORKER, UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Complete worker onboarding and cooperative association' })
  @SwaggerResponse({ status: 201, description: 'Worker onboarded successfully' })
  async onboard(@Request() req: any, @Body() dto: OnboardWorkerDto) {
    return this.workerService.onboardWorker(req.user.id, dto);
  }

  @Patch('me/availability')
  @Roles(UserRole.WORKER)
  @ApiOperation({ summary: 'Update worker real-time availability status (AVAILABLE/BUSY/OFFLINE)' })
  @SwaggerResponse({ status: 200, description: 'Availability status updated successfully' })
  async updateAvailability(@Request() req: any, @Body() dto: UpdateAvailabilityDto) {
    return this.workerService.updateAvailability(req.user.id, dto);
  }

  @Patch('me/location')
  @Roles(UserRole.WORKER)
  @ApiOperation({ summary: 'Update worker current GPS coordinates (PostGIS 4326 Point)' })
  @SwaggerResponse({ status: 200, description: 'Location updated successfully' })
  async updateLocation(@Request() req: any, @Body() dto: UpdateLocationDto) {
    return this.workerService.updateLocation(req.user.id, dto);
  }

  @Get('me/skills')
  @Roles(UserRole.WORKER)
  @ApiOperation({ summary: 'Retrieve worker Skill Passport and verification records' })
  @SwaggerResponse({ status: 200, description: 'Skill passport retrieved successfully' })
  async getMySkillPassport(@Request() req: any) {
    return this.workerService.getSkillPassport(req.user.id);
  }

  @Post('me/skills')
  @Roles(UserRole.WORKER)
  @ApiOperation({ summary: 'Register a new trade skill claim into worker Skill Passport' })
  @SwaggerResponse({ status: 201, description: 'Skill claim created, pending cooperative verification' })
  async claimSkill(@Request() req: any, @Body() dto: AddWorkerSkillDto) {
    return this.workerService.claimSkill(req.user.id, dto);
  }

  @Get('me/jobs')
  @Roles(UserRole.WORKER)
  @ApiOperation({ summary: 'Retrieve dispatched and assigned bookings for current worker' })
  @SwaggerResponse({ status: 200, description: 'Assigned jobs list retrieved' })
  async getMyAssignedJobs(@Request() req: any) {
    return this.workerService.getAssignedJobs(req.user.id);
  }

  @Post('me/jobs/:bookingId/respond')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.WORKER)
  @ApiOperation({ summary: 'Accept or decline assigned job dispatch' })
  @SwaggerResponse({ status: 200, description: 'Job dispatch response recorded' })
  async respondToJob(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: RespondJobDto,
  ) {
    return this.workerService.respondToJob(req.user.id, bookingId, dto);
  }

  @Get('dashboard/metrics')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Retrieve computed workforce dashboard analytics and KPIs' })
  @SwaggerResponse({ status: 200, description: 'Dashboard metrics calculated from database' })
  async getDashboardMetrics() {
    return this.workerService.getDashboardMetrics();
  }

  @Post()
  @Roles(UserRole.WORKER, UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create or onboard worker profile' })
  @SwaggerResponse({ status: 201, description: 'Worker created successfully' })
  async createWorker(@Request() req: any, @Body() dto: OnboardWorkerDto) {
    return this.workerService.onboardWorker(req.user.id, dto);
  }

  @Get()
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Query and list cooperative workers with filters' })
  @SwaggerResponse({ status: 200, description: 'Workers list retrieved successfully' })
  async listWorkers(@Query() query: QueryWorkersDto) {
    return this.workerService.listWorkers(query);
  }

  @Get(':id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get worker profile by Worker UUID' })
  @SwaggerResponse({ status: 200, description: 'Worker profile retrieved' })
  async getWorkerById(@Param('id') id: string) {
    return this.workerService.getProfileById(id);
  }

  @Patch(':id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update worker profile details' })
  @SwaggerResponse({ status: 200, description: 'Worker profile updated successfully' })
  async updateWorker(@Param('id') id: string, @Body() dto: UpdateWorkerDto) {
    return this.workerService.updateWorker(id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update worker availability or operational status' })
  @SwaggerResponse({ status: 200, description: 'Worker status updated successfully' })
  async updateWorkerStatus(@Param('id') id: string, @Body() dto: UpdateWorkerStatusDto) {
    return this.workerService.updateWorkerStatus(id, dto);
  }

  @Patch(':id/skills/:skillId/verify')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Verify or revoke worker skill endorsement in Skill Passport' })
  @SwaggerResponse({ status: 200, description: 'Skill verification status updated' })
  async verifySkill(
    @Param('id') workerId: string,
    @Param('skillId') skillId: string,
    @Body() dto: VerifyWorkerSkillDto,
  ) {
    return this.workerService.verifySkill(workerId, skillId, dto);
  }
}

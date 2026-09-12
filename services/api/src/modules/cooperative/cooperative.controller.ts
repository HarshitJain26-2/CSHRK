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
import { CooperativeService } from './cooperative.service';
import {
  CreateCooperativeDto,
  UpdateCooperativeDto,
  UpdateAffiliationDto,
} from './dto/cooperative.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, MembershipStatus } from '@cshrk/types';

@ApiTags('Cooperatives & Workforce Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cooperatives')
export class CooperativeController {
  constructor(private readonly coopService: CooperativeService) {}

  @Get('me')
  @Roles(UserRole.COOPERATIVE_ADMIN)
  @ApiOperation({ summary: 'Get current authenticated cooperative administrator society' })
  @ApiResponse({ status: 200, description: 'Cooperative society retrieved' })
  async getMyCooperative(@Request() req: any) {
    return this.coopService.getMyCooperative(req.user);
  }

  @Post()
  @Roles(UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Register a new primary labour cooperative society' })
  @ApiResponse({ status: 201, description: 'Cooperative registered' })
  async createCooperative(@Body() dto: CreateCooperativeDto) {
    return this.coopService.createCooperative(dto);
  }

  @Get()
  @Roles(
    UserRole.WORKER,
    UserRole.CUSTOMER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'List registered cooperatives' })
  @ApiResponse({ status: 200, description: 'List of cooperatives' })
  async listCooperatives(
    @Query('district') district?: string,
    @Query('search') search?: string,
  ) {
    return this.coopService.listCooperatives(district, search);
  }

  @Get(':id')
  @Roles(
    UserRole.WORKER,
    UserRole.CUSTOMER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'Get cooperative society details' })
  @ApiResponse({ status: 200, description: 'Cooperative details retrieved' })
  async getCooperativeById(@Param('id') id: string) {
    return this.coopService.getCooperativeById(id);
  }

  @Patch(':id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update cooperative society parameters' })
  @ApiResponse({ status: 200, description: 'Cooperative updated' })
  async updateCooperative(
    @Param('id') id: string,
    @Body() dto: UpdateCooperativeDto,
    @Request() req: any,
  ) {
    await this.coopService.validateCooperativeAccess(req.user, id);
    return this.coopService.updateCooperative(id, dto);
  }

  @Get(':id/members')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List affiliated member workers of a cooperative' })
  @ApiResponse({ status: 200, description: 'Member workers retrieved' })
  async getMembers(@Param('id') id: string, @Request() req: any) {
    await this.coopService.validateCooperativeAccess(req.user, id);
    return this.coopService.getCooperativeMembers(id);
  }

  @Patch(':id/affiliation/:workerId')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update or reassign worker cooperative affiliation' })
  @ApiResponse({ status: 200, description: 'Affiliation updated' })
  async updateAffiliation(
    @Param('id') cooperativeId: string,
    @Param('workerId') workerId: string,
    @Body() dto: UpdateAffiliationDto,
    @Request() req: any,
  ) {
    await this.coopService.validateCooperativeAccess(req.user, cooperativeId);
    return this.coopService.updateAffiliation(cooperativeId, workerId, dto);
  }

  @Get(':id/capacity')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get time-window aware operational workforce capacity' })
  @ApiResponse({ status: 200, description: 'Capacity breakdown' })
  async getCapacity(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skillId') skillId?: string,
    @Request() req?: any,
  ) {
    await this.coopService.validateCooperativeAccess(req.user, id);
    return this.coopService.getCapacity(id, { startDate, endDate, skillId });
  }

  @Get(':id/utilization')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get workforce utilization metrics' })
  @ApiResponse({ status: 200, description: 'Utilization metrics' })
  async getUtilization(@Param('id') id: string, @Request() req: any) {
    await this.coopService.validateCooperativeAccess(req.user, id);
    return this.coopService.getUtilization(id);
  }

  @Get(':id/memberships')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get membership history and active rosters' })
  @ApiResponse({ status: 200, description: 'Memberships retrieved' })
  async getMemberships(
    @Param('id') id: string,
    @Query('status') status?: MembershipStatus,
    @Request() req?: any,
  ) {
    await this.coopService.validateCooperativeAccess(req.user, id);
    return this.coopService.getMemberships(id, status);
  }

  @Patch(':id/memberships/:membershipId/status')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update worker membership verification status' })
  @ApiResponse({ status: 200, description: 'Membership status updated' })
  async updateMembershipStatus(
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
    @Body() body: { status: MembershipStatus; notes?: string },
    @Request() req: any,
  ) {
    await this.coopService.validateCooperativeAccess(req.user, id);
    return this.coopService.updateMembershipStatus(
      id,
      membershipId,
      body.status,
      req.user.id,
      body.notes,
    );
  }

  @Get(':id/welfare-training')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get welfare records and credential training distribution' })
  @ApiResponse({ status: 200, description: 'Welfare and training data' })
  async getWelfareAndTraining(@Param('id') id: string, @Request() req: any) {
    await this.coopService.validateCooperativeAccess(req.user, id);
    return this.coopService.getWelfareAndTraining(id);
  }
}

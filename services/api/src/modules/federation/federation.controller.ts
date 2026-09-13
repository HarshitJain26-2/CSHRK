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
import { FederationService } from './federation.service';
import {
  CreateFulfillmentProposalDto,
  RespondAllocationDto,
} from './dto/federation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';

@ApiTags('Federation Network & Multi-Coop Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('federations')
export class FederationController {
  constructor(private readonly fedService: FederationService) {}

  @Get('me')
  @Roles(UserRole.FEDERATION_ADMIN)
  @ApiOperation({ summary: 'Get current authenticated federation administration profile' })
  @ApiResponse({ status: 200, description: 'Federation retrieved' })
  async getMyFederation(@Request() req: any) {
    return this.fedService.getMyFederation(req.user);
  }

  @Get()
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List all registered federations' })
  @ApiResponse({ status: 200, description: 'Federations list' })
  async listFederations() {
    return this.fedService.listFederations();
  }

  @Get(':id')
  @Roles(UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get federation profile details' })
  @ApiResponse({ status: 200, description: 'Federation profile' })
  async getFederationById(@Param('id') id: string, @Request() req: any) {
    await this.fedService.validateFederationAccess(req.user, id);
    return this.fedService.getFederationById(id);
  }

  @Get(':id/cooperatives')
  @Roles(UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List member cooperatives belonging to federation' })
  @ApiResponse({ status: 200, description: 'Member cooperatives with worker counts' })
  async listMemberCooperatives(@Param('id') id: string, @Request() req: any) {
    await this.fedService.validateFederationAccess(req.user, id);
    return this.fedService.listMemberCooperatives(id);
  }

  @Get(':id/workforce')
  @Roles(UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Query network-wide workforce across member cooperatives' })
  @ApiResponse({ status: 200, description: 'Network workforce list' })
  async getNetworkWorkforce(
    @Param('id') id: string,
    @Query('skillId') skillId?: string,
    @Query('district') district?: string,
    @Query('search') search?: string,
    @Request() req?: any,
  ) {
    await this.fedService.validateFederationAccess(req.user, id);
    return this.fedService.getNetworkWorkforce(id, { skillId, district, search });
  }

  @Get(':id/capacity')
  @Roles(UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get aggregated network capacity across member cooperatives' })
  @ApiResponse({ status: 200, description: 'Aggregated capacity breakdown' })
  async getNetworkCapacity(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skillId') skillId?: string,
    @Request() req?: any,
  ) {
    await this.fedService.validateFederationAccess(req.user, id);
    return this.fedService.getNetworkCapacity(id, { startDate, endDate, skillId });
  }

  @Get(':id/geographic-coverage')
  @Roles(UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get geographic spatial coverage of cooperatives and workers' })
  @ApiResponse({ status: 200, description: 'Geographic spatial distribution' })
  async getGeographicCoverage(@Param('id') id: string, @Request() req: any) {
    await this.fedService.validateFederationAccess(req.user, id);
    return this.fedService.getGeographicCoverage(id);
  }

  @Post(':id/fulfillment-plans')
  @Roles(UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create multi-cooperative fulfillment proposal plan' })
  @ApiResponse({ status: 201, description: 'Proposal created in PENDING_COOPERATIVE_APPROVAL' })
  async createFulfillmentProposal(
    @Param('id') id: string,
    @Body() dto: CreateFulfillmentProposalDto,
    @Request() req: any,
  ) {
    await this.fedService.validateFederationAccess(req.user, id);
    return this.fedService.createFulfillmentProposal(id, dto, req.user.id);
  }

  @Get(':id/fulfillment-plans')
  @Roles(UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.COOPERATIVE_ADMIN)
  @ApiOperation({ summary: 'List multi-cooperative fulfillment plans' })
  @ApiResponse({ status: 200, description: 'Fulfillment plans retrieved' })
  async listFulfillmentPlans(@Param('id') id: string, @Request() req: any) {
    if (req.user.role === UserRole.FEDERATION_ADMIN) {
      await this.fedService.validateFederationAccess(req.user, id);
    }
    return this.fedService.listFulfillmentPlans(id);
  }

  @Patch('fulfillment-allocations/:allocationId/respond')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Cooperative review and approval/rejection of proposed allocation' })
  @ApiResponse({ status: 200, description: 'Allocation response recorded' })
  async respondAllocation(
    @Param('allocationId') allocationId: string,
    @Body() dto: RespondAllocationDto,
    @Request() req: any,
  ) {
    return this.fedService.respondAllocation(allocationId, dto, req.user);
  }
}

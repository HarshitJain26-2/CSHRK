import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
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
import { UserRole } from '@cshrk/types';

@ApiTags('Cooperatives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cooperatives')
export class CooperativeController {
  constructor(private readonly coopService: CooperativeService) {}

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
  ) {
    return this.coopService.updateCooperative(id, dto);
  }

  @Get(':id/members')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List affiliated member workers of a cooperative' })
  @ApiResponse({ status: 200, description: 'Member workers retrieved' })
  async getMembers(@Param('id') id: string) {
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
  ) {
    return this.coopService.updateAffiliation(cooperativeId, workerId, dto);
  }
}

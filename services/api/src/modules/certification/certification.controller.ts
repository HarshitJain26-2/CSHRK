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
import { CertificationService } from './certification.service';
import {
  CreateCertificationDto,
  UpdateCertificationDto,
  VerifyCertificationDto,
  RenewCertificationDto,
} from './dto/certification.dto';
import { CertificationStatus } from '../../database/entities/certification.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';

@ApiTags('Certifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('certifications')
export class CertificationController {
  constructor(private readonly certService: CertificationService) {}

  @Post()
  @Roles(UserRole.WORKER, UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Register a new certification for a worker' })
  @ApiResponse({ status: 201, description: 'Certification recorded' })
  async createCertification(@Body() dto: CreateCertificationDto) {
    return this.certService.createCertification(dto);
  }

  @Get()
  @Roles(
    UserRole.WORKER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'List and filter certifications' })
  @ApiResponse({ status: 200, description: 'List of certifications' })
  async listCertifications(
    @Query('status') status?: CertificationStatus,
    @Query('workerId') workerId?: string,
    @Query('search') search?: string,
  ) {
    return this.certService.listCertifications(status, workerId, search);
  }

  @Get(':id')
  @Roles(
    UserRole.WORKER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'Get certification details' })
  @ApiResponse({ status: 200, description: 'Certification details retrieved' })
  async getCertificationById(@Param('id') id: string) {
    return this.certService.getCertificationById(id);
  }

  @Patch(':id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update certification details' })
  @ApiResponse({ status: 200, description: 'Certification updated' })
  async updateCertification(
    @Param('id') id: string,
    @Body() dto: UpdateCertificationDto,
  ) {
    return this.certService.updateCertification(id, dto);
  }

  @Patch(':id/verify')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Verify or reject a certification record' })
  @ApiResponse({ status: 200, description: 'Verification status recorded' })
  async verifyCertification(
    @Param('id') id: string,
    @Body() dto: VerifyCertificationDto,
  ) {
    return this.certService.verifyCertification(id, dto);
  }

  @Patch(':id/renew')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Renew certification with extended expiration date' })
  @ApiResponse({ status: 200, description: 'Certification renewed' })
  async renewCertification(
    @Param('id') id: string,
    @Body() dto: RenewCertificationDto,
  ) {
    return this.certService.renewCertification(id, dto);
  }
}

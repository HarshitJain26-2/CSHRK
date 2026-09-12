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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';
import {
  CreateServiceRequestDto,
  QueryCandidatesDto,
} from './dto/service-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';

@ApiTags('Service Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('service-requests')
export class ServiceRequestController {
  constructor(
    private readonly serviceRequestService: ServiceRequestService,
  ) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a new customer service request' })
  @SwaggerResponse({ status: 201, description: 'Service request created successfully' })
  async createRequest(
    @Request() req: any,
    @Body() dto: CreateServiceRequestDto,
  ) {
    return this.serviceRequestService.createRequest(req.user.id, dto);
  }

  @Get('me')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'List all service requests created by authenticated customer' })
  @SwaggerResponse({ status: 200, description: 'Customer service requests retrieved' })
  async listMyRequests(@Request() req: any) {
    return this.serviceRequestService.listCustomerRequests(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.PLATFORM_ADMIN, UserRole.COOPERATIVE_ADMIN)
  @ApiOperation({ summary: 'Get service request details by ID with ownership verification' })
  @SwaggerResponse({ status: 200, description: 'Service request retrieved' })
  async getRequestById(@Request() req: any, @Param('id') id: string) {
    return this.serviceRequestService.getRequestById(req.user.id, id);
  }

  @Get(':id/candidates')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Discover nearby eligible workers using PostGIS ST_DistanceSphere' })
  @SwaggerResponse({ status: 200, description: 'Eligible worker candidates retrieved' })
  async discoverCandidates(
    @Request() req: any,
    @Param('id') id: string,
    @Query() query: QueryCandidatesDto,
  ) {
    return this.serviceRequestService.discoverCandidates(req.user.id, id, query);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Cancel pending service request' })
  @SwaggerResponse({ status: 200, description: 'Service request cancelled successfully' })
  async cancelRequest(@Request() req: any, @Param('id') id: string) {
    return this.serviceRequestService.cancelRequest(req.user.id, id);
  }
}

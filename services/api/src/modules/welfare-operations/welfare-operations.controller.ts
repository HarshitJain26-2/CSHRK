import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';
import { WelfareOperationsService } from './welfare-operations.service';
import {
  CreateWorkerSupportRequestDto,
  UpdateWorkerSupportRequestDto,
} from './dto/welfare.dto';

@ApiTags('Worker Welfare & Support Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('welfare-operations')
export class WelfareOperationsController {
  constructor(private readonly welfareService: WelfareOperationsService) {}

  @Post('requests')
  @Roles(UserRole.WORKER)
  @ApiOperation({ summary: 'Submit a worker welfare or workplace safety support request' })
  @SwaggerResponse({ status: 201, description: 'Support request submitted to cooperative' })
  async createRequest(
    @Request() req: any,
    @Body() dto: CreateWorkerSupportRequestDto,
  ) {
    return this.welfareService.createSupportRequest(req.user.id, dto);
  }

  @Get('requests')
  @Roles(UserRole.WORKER, UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List support requests within user/cooperative scope' })
  @SwaggerResponse({ status: 200, description: 'Support requests retrieved' })
  async listRequests(@Request() req: any) {
    return this.welfareService.listSupportRequests(req.user.id, req.user.role);
  }

  @Patch('requests/:id/status')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update support request lifecycle status and record action taken' })
  @SwaggerResponse({ status: 200, description: 'Support request status updated' })
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateWorkerSupportRequestDto,
  ) {
    return this.welfareService.updateSupportRequestStatus(req.user.id, req.user.role, id, dto);
  }

  @Get('records')
  @Roles(UserRole.WORKER, UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List cooperative welfare fund allocation records' })
  @SwaggerResponse({ status: 200, description: 'Welfare records retrieved' })
  async listWelfareRecords(@Request() req: any) {
    return this.welfareService.listWelfareRecords(req.user.id, req.user.role);
  }
}

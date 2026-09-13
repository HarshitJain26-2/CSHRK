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
import { SosService } from './sos.service';
import {
  CreateSosAlertDto,
  UpdateSosStatusDto,
  AssignSosResponderDto,
} from './dto/sos.dto';

@ApiTags('Emergency SOS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('emergency/sos')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.WORKER)
  @ApiOperation({ summary: 'Trigger an Emergency SOS alert with current coordinates' })
  @SwaggerResponse({ status: 201, description: 'SOS Alert broadcasted to cooperative responders' })
  async triggerSos(@Request() req: any, @Body() dto: CreateSosAlertDto) {
    return this.sosService.triggerSosAlert(req.user.id, req.user.role, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List accessible SOS alerts based on operational scope' })
  @SwaggerResponse({ status: 200, description: 'Active and past SOS alerts' })
  async listAlerts(@Request() req: any) {
    return this.sosService.listAlerts(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SOS alert details, verified coordinates, and update timeline' })
  @SwaggerResponse({ status: 200, description: 'SOS alert retrieved with statutory disclaimer' })
  async getAlert(@Request() req: any, @Param('id') id: string) {
    return this.sosService.getSosAlertById(req.user.id, req.user.role, id);
  }

  @Post(':id/assign')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Dispatch an operational responder to the emergency' })
  @SwaggerResponse({ status: 200, description: 'Responder dispatched' })
  async assignResponder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AssignSosResponderDto,
  ) {
    return this.sosService.assignResponder(req.user.id, req.user.role, id, dto);
  }

  @Patch(':id/status')
  @Roles(
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
    UserRole.WORKER,
  )
  @ApiOperation({ summary: 'Update SOS emergency status or resolve alert' })
  @SwaggerResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSosStatusDto,
  ) {
    return this.sosService.updateSosStatus(req.user.id, req.user.role, id, dto);
  }
}

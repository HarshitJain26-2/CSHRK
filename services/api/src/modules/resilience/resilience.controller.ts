import {
  Controller,
  Post,
  Body,
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
import { ResilienceService } from './resilience.service';
import { OfflineSyncQueueDto } from './dto/resilience.dto';

@ApiTags('Resilience & Offline Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resilience')
export class ResilienceController {
  constructor(private readonly resilienceService: ResilienceService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Synchronize queued client offline operations with conflict resolution' })
  @SwaggerResponse({ status: 200, description: 'Offline queue processed and results returned' })
  async syncOfflineBatch(
    @Request() req: any,
    @Body() dto: OfflineSyncQueueDto,
  ) {
    return this.resilienceService.processSyncBatch(
      req.user.id,
      req.user.role,
      dto,
    );
  }
}

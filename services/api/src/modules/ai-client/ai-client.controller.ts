import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@cshrk/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AIClientService } from './ai-client.service';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AIClientController {
  constructor(private readonly aiClientService: AIClientService) {}

  @Post('demand-forecast')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.COOPERATIVE_ADMIN)
  async getDemandForecast(
    @Body()
    body: {
      districtCode: string;
      category: string;
      forecastDaysAhead?: number;
      history?: Array<{ date: string; request_count: number }>;
    },
  ) {
    const data = await this.aiClientService.getDemandForecast(
      body.districtCode,
      body.category,
      body.forecastDaysAhead || 7,
      body.history,
    );
    return {
      success: true,
      statusCode: 200,
      data,
    };
  }

  @Post('workforce-allocation')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.COOPERATIVE_ADMIN)
  async getWorkforceAllocation(
    @Body()
    body: {
      cooperativeId: string;
      targetDate: string;
      jobs: any[];
      workers: any[];
    },
  ) {
    const data = await this.aiClientService.getWorkforceAllocation(
      body.cooperativeId,
      body.targetDate,
      body.jobs,
      body.workers,
    );
    return {
      success: true,
      statusCode: 200,
      message: 'AI allocation recommendation generated (Cooperative approval required)',
      data,
    };
  }

  @Post('skill-gap')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.COOPERATIVE_ADMIN)
  async getSkillGapAnalysis(
    @Body()
    body: {
      districtCode: string;
      lookbackDays?: number;
      tradeData: any[];
    },
  ) {
    const data = await this.aiClientService.getSkillGapAnalysis(
      body.districtCode,
      body.lookbackDays || 30,
      body.tradeData,
    );
    return {
      success: true,
      statusCode: 200,
      data,
    };
  }

  @Get('models')
  async listModels() {
    const data = await this.aiClientService.listModels();
    return {
      success: true,
      statusCode: 200,
      data,
    };
  }

  @Get('logs')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN)
  async getInferenceLogs(@Query('limit') limit?: number) {
    const logs = await this.aiClientService.getInferenceLogs(limit ? Number(limit) : 50);
    return {
      success: true,
      statusCode: 200,
      data: logs,
    };
  }
}

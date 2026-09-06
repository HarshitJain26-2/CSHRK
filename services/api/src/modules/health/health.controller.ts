import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { DataSource } from 'typeorm';

@ApiTags('System & Observability')
@Controller('health')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'System and database health check' })
  @ApiResponse({ status: 200, description: 'Service is operational and healthy' })
  @ApiResponse({ status: 503, description: 'Database or service is degraded' })
  async getHealth(@Res() res: Response) {
    let dbStatus = 'disconnected';
    let isHealthy = false;

    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbStatus = 'connected';
        isHealthy = true;
      }
    } catch (err: any) {
      dbStatus = `error: ${err.message}`;
    }

    const payload = {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'cshrk-api',
      version: '0.1.0',
      database: dbStatus,
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
      timestamp: new Date().toISOString(),
    };

    return res
      .status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
      .json(payload);
  }
}

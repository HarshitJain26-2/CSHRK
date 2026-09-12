import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceCatalogService } from './service-catalog.service';
import { QueryServicesDto } from './dto/service-catalog.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServiceCatalogController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List all active service categories with counts' })
  @SwaggerResponse({ status: 200, description: 'Categories retrieved successfully' })
  async listCategories() {
    return this.serviceCatalogService.listCategories();
  }

  @Get()
  @ApiOperation({ summary: 'List services with search and category filtering' })
  @SwaggerResponse({ status: 200, description: 'Services list retrieved successfully' })
  async listServices(@Query() query: QueryServicesDto) {
    return this.serviceCatalogService.listServices(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service details by ID including required skill' })
  @SwaggerResponse({ status: 200, description: 'Service details retrieved' })
  async getServiceById(@Param('id') id: string) {
    return this.serviceCatalogService.getServiceById(id);
  }
}

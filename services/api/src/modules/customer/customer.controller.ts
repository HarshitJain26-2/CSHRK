import {
  Controller,
  Get,
  Patch,
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
import { CustomerService } from './customer.service';
import { UpdateCustomerProfileDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('me')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get current authenticated customer profile' })
  @SwaggerResponse({ status: 200, description: 'Customer profile retrieved successfully' })
  async getMyProfile(@Request() req: any) {
    return this.customerService.getProfileByUserId(req.user.id);
  }

  @Patch('me')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Update current authenticated customer profile and default location' })
  @SwaggerResponse({ status: 200, description: 'Customer profile updated successfully' })
  async updateMyProfile(
    @Request() req: any,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.customerService.updateProfile(req.user.id, dto);
  }
}

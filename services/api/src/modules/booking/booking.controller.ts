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
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  UpdateBookingStatusDto,
  RateBookingDto,
  QueryBookingsDto,
} from './dto/booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a new booking and dispatch to candidate worker (PENDING_ACCEPTANCE)' })
  @SwaggerResponse({ status: 201, description: 'Booking request sent successfully' })
  async createBooking(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.id, dto);
  }

  @Get('me')
  @Roles(UserRole.CUSTOMER, UserRole.WORKER)
  @ApiOperation({ summary: 'List bookings for current authenticated customer or worker' })
  @SwaggerResponse({ status: 200, description: 'Bookings list retrieved' })
  async listMyBookings(@Request() req: any, @Query() query: QueryBookingsDto) {
    return this.bookingService.listUserBookings(req.user.id, req.user.role, query);
  }

  @Get('admin/all')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.COOPERATIVE_ADMIN)
  @ApiOperation({ summary: 'List all bookings across marketplace for administrative monitoring' })
  @SwaggerResponse({ status: 200, description: 'All marketplace bookings retrieved' })
  async listAdminBookings(@Query() query: QueryBookingsDto) {
    return this.bookingService.listAdminBookings(query);
  }

  @Get(':id')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
    UserRole.PLATFORM_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.COOPERATIVE_ADMIN,
  )
  @ApiOperation({ summary: 'Get booking details by ID with authorization verification' })
  @SwaggerResponse({ status: 200, description: 'Booking details retrieved' })
  async getBookingById(@Request() req: any, @Param('id') id: string) {
    return this.bookingService.getBookingById(req.user.id, req.user.role, id);
  }

  @Patch(':id/status')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
    UserRole.PLATFORM_ADMIN,
    UserRole.COOPERATIVE_ADMIN,
  )
  @ApiOperation({ summary: 'Transition booking status using canonical state machine rules' })
  @SwaggerResponse({ status: 200, description: 'Booking status updated' })
  async updateBookingStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingService.updateBookingStatus(
      req.user.id,
      req.user.role,
      id,
      dto,
    );
  }

  @Post(':id/rate')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Submit Customer -> Worker rating and review for a COMPLETED booking' })
  @SwaggerResponse({ status: 201, description: 'Rating submitted and worker metrics updated' })
  async rateBooking(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RateBookingDto,
  ) {
    return this.bookingService.rateBooking(req.user.id, id, dto);
  }
}

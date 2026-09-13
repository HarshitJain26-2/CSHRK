import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { NotificationService } from './notification.service';
import {
  RegisterPushTokenDto,
  UpdateNotificationPreferencesDto,
  QueryNotificationsDto,
} from './dto/notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated notifications for current user' })
  @SwaggerResponse({ status: 200, description: 'User notifications retrieved' })
  async listMyNotifications(
    @Request() req: any,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationService.listUserNotifications(req.user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread notifications count' })
  @SwaggerResponse({ status: 200, description: 'Unread count retrieved' })
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @SwaggerResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(req.user.id, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  @SwaggerResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Post('push-tokens')
  @ApiOperation({ summary: 'Register or refresh mobile push notification token' })
  @SwaggerResponse({ status: 201, description: 'Push token registered' })
  async registerPushToken(
    @Request() req: any,
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.notificationService.registerPushToken(req.user.id, dto);
  }

  @Delete('push-tokens/:token')
  @ApiOperation({ summary: 'Deactivate push notification token upon logout' })
  @SwaggerResponse({ status: 200, description: 'Push token deactivated' })
  async unregisterPushToken(
    @Request() req: any,
    @Param('token') token: string,
  ) {
    return this.notificationService.unregisterPushToken(req.user.id, token);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @SwaggerResponse({ status: 200, description: 'Notification preferences retrieved' })
  async getPreferences(@Request() req: any) {
    return this.notificationService.getUserPreferences(req.user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user notification channel preference' })
  @SwaggerResponse({ status: 200, description: 'Preference updated successfully' })
  async updatePreference(
    @Request() req: any,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationService.updatePreference(req.user.id, dto);
  }
}

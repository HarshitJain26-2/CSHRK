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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import {
  CreateConversationDto,
  SendMessageDto,
  QueryMessagesDto,
} from './dto/communication.dto';

@ApiTags('Communication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conversations')
export class CommunicationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  @Post('booking/:bookingId')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'Get or create conversation for an authorized booking' })
  @SwaggerResponse({ status: 200, description: 'Conversation established' })
  async getOrCreateBookingConversation(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
  ) {
    return this.conversationService.getOrCreateBookingConversation(
      req.user.id,
      req.user.role,
      bookingId,
    );
  }

  @Post()
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'Create a new access-controlled conversation' })
  @SwaggerResponse({ status: 201, description: 'Conversation created' })
  async createConversation(
    @Request() req: any,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationService.createConversation(
      req.user.id,
      req.user.role,
      dto,
    );
  }

  @Get()
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'List conversations accessible to the current user' })
  @SwaggerResponse({ status: 200, description: 'User conversations retrieved' })
  async listConversations(@Request() req: any) {
    return this.conversationService.listUserConversations(
      req.user.id,
      req.user.role,
    );
  }

  @Get(':id')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'Get conversation details by ID with access control' })
  @SwaggerResponse({ status: 200, description: 'Conversation retrieved' })
  async getConversation(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.conversationService.getConversationById(
      req.user.id,
      req.user.role,
      id,
    );
  }

  @Post(':id/messages')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'Send a message in an authorized conversation with rate limiting' })
  @SwaggerResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messageService.sendMessage(
      req.user.id,
      req.user.role,
      id,
      dto,
    );
  }

  @Get(':id/messages')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'Fetch paginated messages in an authorized conversation' })
  @SwaggerResponse({ status: 200, description: 'Messages list retrieved' })
  async listMessages(
    @Request() req: any,
    @Param('id') id: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.messageService.listMessages(
      req.user.id,
      req.user.role,
      id,
      query,
    );
  }

  @Patch(':id/messages/:messageId/read')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'Mark a received message as read' })
  @SwaggerResponse({ status: 200, description: 'Message marked as read' })
  async markRead(
    @Request() req: any,
    @Param('id') id: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messageService.markMessageRead(
      req.user.id,
      req.user.role,
      id,
      messageId,
    );
  }
}

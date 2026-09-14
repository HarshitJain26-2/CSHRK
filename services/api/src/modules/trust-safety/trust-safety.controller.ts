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
import { ComplaintService } from './complaint.service';
import { DisputeService } from './dispute.service';
import { ModerationService } from './moderation.service';
import {
  CreateComplaintDto,
  UpdateComplaintStatusDto,
  CreateDisputeDto,
  UpdateDisputeStatusDto,
  AddDisputeEvidenceDto,
  ResolveDisputeDto,
  CreateAccountRestrictionDto,
  RevokeAccountRestrictionDto,
} from './dto/trust-safety.dto';

@ApiTags('Trust & Safety')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trust-safety')
export class TrustSafetyController {
  constructor(
    private readonly complaintService: ComplaintService,
    private readonly disputeService: DisputeService,
    private readonly moderationService: ModerationService,
  ) {}

  // ==============================================================================
  // COMPLAINT ENDPOINTS
  // ==============================================================================
  @Post('complaints')
  @Roles(UserRole.CUSTOMER, UserRole.WORKER)
  @ApiOperation({ summary: 'Lodge a formal grievance or complaint regarding a booking' })
  @SwaggerResponse({ status: 201, description: 'Complaint lodged successfully' })
  async createComplaint(@Request() req: any, @Body() dto: CreateComplaintDto) {
    return this.complaintService.createComplaint(req.user.id, req.user.role, dto);
  }

  @Get('complaints')
  @ApiOperation({ summary: 'List accessible complaints based on user role' })
  @SwaggerResponse({ status: 200, description: 'Complaints list retrieved' })
  async listComplaints(@Request() req: any) {
    return this.complaintService.listComplaints(req.user.id, req.user.role);
  }

  @Get('complaints/:id')
  @ApiOperation({ summary: 'Get complaint details and history by ID' })
  @SwaggerResponse({ status: 200, description: 'Complaint details retrieved' })
  async getComplaint(@Request() req: any, @Param('id') id: string) {
    return this.complaintService.getComplaintById(req.user.id, req.user.role, id);
  }

  @Patch('complaints/:id/status')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Advance complaint lifecycle status with review notes' })
  @SwaggerResponse({ status: 200, description: 'Complaint status updated' })
  async updateComplaintStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateComplaintStatusDto,
  ) {
    return this.complaintService.updateComplaintStatus(req.user.id, req.user.role, id, dto);
  }

  // ==============================================================================
  // DISPUTE ENDPOINTS
  // ==============================================================================
  @Post('disputes')
  @Roles(UserRole.CUSTOMER, UserRole.WORKER)
  @ApiOperation({ summary: 'Open an operational dispute for a booking' })
  @SwaggerResponse({ status: 201, description: 'Dispute opened and booking state marked as DISPUTED' })
  async createDispute(@Request() req: any, @Body() dto: CreateDisputeDto) {
    return this.disputeService.createDispute(req.user.id, req.user.role, dto);
  }

  @Get('disputes')
  @ApiOperation({ summary: 'List disputes accessible to current user' })
  @SwaggerResponse({ status: 200, description: 'Disputes retrieved' })
  async listDisputes(@Request() req: any) {
    return this.disputeService.listDisputes(req.user.id, req.user.role);
  }

  @Get('disputes/:id')
  @ApiOperation({ summary: 'Get dispute details with evidence timeline' })
  @SwaggerResponse({ status: 200, description: 'Dispute details retrieved' })
  async getDispute(@Request() req: any, @Param('id') id: string) {
    return this.disputeService.getDisputeById(req.user.id, req.user.role, id);
  }

  @Post('disputes/:id/evidences')
  @Roles(UserRole.CUSTOMER, UserRole.WORKER, UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Submit verified evidence (document/image) for an active dispute' })
  @SwaggerResponse({ status: 201, description: 'Evidence added to dispute' })
  async addDisputeEvidence(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddDisputeEvidenceDto,
  ) {
    return this.disputeService.addEvidence(req.user.id, req.user.role, id, dto);
  }

  @Patch('disputes/:id/status')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update dispute state machine lifecycle' })
  @SwaggerResponse({ status: 200, description: 'Dispute status updated' })
  async updateDisputeStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDisputeStatusDto,
  ) {
    return this.disputeService.updateDisputeStatus(req.user.id, req.user.role, id, dto);
  }

  @Post('disputes/:id/resolve')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Arbitrate dispute with binding resolution and optional payment refund' })
  @SwaggerResponse({ status: 200, description: 'Dispute resolved and financial state transitioned safely' })
  async resolveDispute(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputeService.resolveDispute(req.user.id, req.user.role, id, dto);
  }

  // ==============================================================================
  // MODERATION & ACCOUNT RESTRICTION ENDPOINTS
  // ==============================================================================
  @Post('moderation/restrictions')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN)
  @ApiOperation({ summary: 'Impose controlled account restriction or suspension' })
  @SwaggerResponse({ status: 201, description: 'Account restriction applied and audited' })
  async restrictAccount(
    @Request() req: any,
    @Body() dto: CreateAccountRestrictionDto,
  ) {
    return this.moderationService.restrictAccount(req.user.id, req.user.role, dto);
  }

  @Patch('moderation/restrictions/:id/revoke')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN)
  @ApiOperation({ summary: 'Revoke an account restriction and reinstate user' })
  @SwaggerResponse({ status: 200, description: 'Restriction revoked and user status restored' })
  async revokeRestriction(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RevokeAccountRestrictionDto,
  ) {
    return this.moderationService.revokeRestriction(req.user.id, req.user.role, id, dto);
  }

  @Get('moderation/restrictions')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.COOPERATIVE_ADMIN)
  @ApiOperation({ summary: 'List all administrative account restrictions' })
  @SwaggerResponse({ status: 200, description: 'Restrictions list retrieved' })
  async listRestrictions() {
    return this.moderationService.listRestrictions();
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ComplaintStatus,
  DisputeStatus,
  DisputeResolution,
  AccountRestrictionType,
} from '@cshrk/types';
import { AttachmentDto } from '../../communication/dto/communication.dto';

export class CreateComplaintDto {
  @ApiProperty({ description: 'Associated booking ID' })
  bookingId: string;

  @ApiProperty({ description: 'Category of the grievance' })
  category: string;

  @ApiProperty({ description: 'Detailed grievance description' })
  description: string;
}

export class UpdateComplaintStatusDto {
  @ApiProperty({ enum: ComplaintStatus })
  status: ComplaintStatus;

  @ApiPropertyOptional({ description: 'Resolution or review notes' })
  resolutionNotes?: string;
}

export class CreateDisputeDto {
  @ApiProperty({ description: 'Associated booking ID' })
  bookingId: string;

  @ApiProperty({ description: 'Detailed reason for dispute' })
  reason: string;

  @ApiProperty({ description: 'Disputed monetary amount' })
  disputedAmount: number;

  @ApiPropertyOptional({ type: [AttachmentDto], description: 'Initial supporting evidence' })
  evidences?: Array<{
    title: string;
    description?: string;
    attachment: AttachmentDto;
  }>;
}

export class UpdateDisputeStatusDto {
  @ApiProperty({ enum: DisputeStatus })
  status: DisputeStatus;

  @ApiPropertyOptional({ description: 'Status update or mediation notes' })
  resolutionNotes?: string;
}

export class AddDisputeEvidenceDto {
  @ApiProperty({ description: 'Evidence title' })
  title: string;

  @ApiPropertyOptional({ description: 'Evidence description' })
  description?: string;

  @ApiProperty({ type: AttachmentDto, description: 'Validated attachment metadata' })
  attachment: AttachmentDto;
}

export class ResolveDisputeDto {
  @ApiProperty({ enum: DisputeResolution })
  resolution: DisputeResolution;

  @ApiProperty({ description: 'Detailed resolution findings and decision rationale' })
  resolutionNotes: string;

  @ApiPropertyOptional({ description: 'Refund amount if resolution involves customer refund' })
  refundAmount?: number;
}

export class CreateAccountRestrictionDto {
  @ApiProperty({ description: 'User ID to restrict' })
  userId: string;

  @ApiProperty({ enum: AccountRestrictionType })
  restrictionType: AccountRestrictionType;

  @ApiProperty({ description: 'Reason for restriction' })
  reason: string;

  @ApiPropertyOptional({ description: 'Expiration date of restriction' })
  expiresAt?: string;
}

export class RevokeAccountRestrictionDto {
  @ApiProperty({ description: 'Reason for revocation' })
  revocationReason: string;
}

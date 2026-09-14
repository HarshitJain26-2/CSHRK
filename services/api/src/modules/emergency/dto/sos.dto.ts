import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SosCategory, SosPriority, SosStatus } from '@cshrk/types';

export class CreateSosAlertDto {
  @ApiPropertyOptional({ description: 'Associated booking ID if emergency occurred on active job' })
  bookingId?: string;

  @ApiProperty({ enum: SosCategory, default: SosCategory.PHYSICAL_SAFETY })
  category: SosCategory;

  @ApiProperty({ enum: SosPriority, default: SosPriority.CRITICAL })
  priority: SosPriority;

  @ApiProperty({ description: 'Latitude coordinate' })
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  longitude: number;

  @ApiPropertyOptional({ description: 'Physical address or landmark description' })
  addressText?: string;

  @ApiPropertyOptional({ description: 'Emergency description or contextual details' })
  description?: string;
}

export class UpdateSosStatusDto {
  @ApiProperty({ enum: SosStatus })
  status: SosStatus;

  @ApiPropertyOptional({ description: 'Resolution findings and notes' })
  resolutionNotes?: string;

  @ApiPropertyOptional({ description: 'Timeline update note' })
  note?: string;
}

export class AssignSosResponderDto {
  @ApiProperty({ description: 'User ID of assigned operational responder' })
  responderId: string;
}

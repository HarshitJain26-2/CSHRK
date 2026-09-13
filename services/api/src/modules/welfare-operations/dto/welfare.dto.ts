import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupportRequestCategory, SupportRequestStatus } from '@cshrk/types';

export class CreateWorkerSupportRequestDto {
  @ApiProperty({ enum: SupportRequestCategory })
  category: SupportRequestCategory;

  @ApiProperty({ description: 'Brief subject line' })
  subject: string;

  @ApiProperty({ description: 'Detailed explanation of issue or assistance required' })
  description: string;
}

export class UpdateWorkerSupportRequestDto {
  @ApiProperty({ enum: SupportRequestStatus })
  status: SupportRequestStatus;

  @ApiPropertyOptional({ description: 'Action taken or resolution notes by cooperative' })
  actionTaken?: string;
}

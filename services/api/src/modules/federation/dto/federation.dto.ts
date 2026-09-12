import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CooperativeAllocationDto {
  @ApiProperty({ description: 'Member cooperative society ID' })
  @IsUUID()
  cooperativeId: string;

  @ApiProperty({ description: 'Number of workers allocated to this cooperative', example: 10 })
  @IsInt()
  @Min(1)
  allocatedWorkers: number;
}

export class CreateFulfillmentProposalDto {
  @ApiProperty({ description: 'Target workforce requirement ID' })
  @IsUUID()
  requirementId: string;

  @ApiProperty({ description: 'Proposal title', example: 'Delhi Metro Facility Multi-Coop Allocation Plan' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Operational fulfillment notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CooperativeAllocationDto], description: 'Cooperative allocations' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CooperativeAllocationDto)
  allocations: CooperativeAllocationDto[];
}

export class RespondAllocationDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'], description: 'Cooperative response' })
  @IsIn(['APPROVE', 'REJECT'])
  action: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ description: 'Reason if rejected' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

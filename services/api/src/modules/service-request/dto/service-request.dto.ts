import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceRequestDto {
  @ApiProperty({ description: 'ID of the requested service from catalog' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: 'Customer description of requirements and issue' })
  @IsString()
  @MinLength(5)
  description: string;

  @ApiProperty({ description: 'Latitude of service location (-90 to 90)' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude of service location (-180 to 180)' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ description: 'Human-readable address or landmark' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  addressText?: string;

  @ApiPropertyOptional({
    enum: ['STANDARD', 'URGENT', 'EMERGENCY'],
    default: 'STANDARD',
  })
  @IsEnum(['STANDARD', 'URGENT', 'EMERGENCY'])
  @IsOptional()
  urgency?: 'STANDARD' | 'URGENT' | 'EMERGENCY' = 'STANDARD';

  @ApiPropertyOptional({ description: 'Requested start time in ISO 8601 format' })
  @IsDateString()
  @IsOptional()
  scheduledTime?: string;
}

export class QueryCandidatesDto {
  @ApiPropertyOptional({ description: 'Search radius in kilometers', default: 25 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  @IsOptional()
  radiusKm?: number = 25;

  @ApiPropertyOptional({ description: 'Maximum candidate results', default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

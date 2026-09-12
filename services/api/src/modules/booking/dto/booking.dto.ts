import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@cshrk/types';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID of the service request to book' })
  @IsUUID()
  @IsNotEmpty()
  serviceRequestId: string;

  @ApiProperty({ description: 'ID of the selected candidate worker' })
  @IsUUID()
  @IsNotEmpty()
  workerId: string;

  @ApiPropertyOptional({ description: 'Scheduled job start time in ISO 8601' })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Estimated service duration in hours', default: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(24)
  @IsOptional()
  durationHours?: number = 2;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus, description: 'Target booking lifecycle state' })
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;

  @ApiPropertyOptional({ description: 'Optional cancellation or dispute reason' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class RateBookingDto {
  @ApiProperty({ description: 'Rating score between 1 and 5 stars', minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @ApiPropertyOptional({ description: 'Optional customer review comment' })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class QueryBookingsDto {
  @ApiPropertyOptional({ enum: BookingStatus, description: 'Filter by lifecycle state' })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

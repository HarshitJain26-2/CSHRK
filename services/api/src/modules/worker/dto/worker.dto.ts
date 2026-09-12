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
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  WorkerAvailabilityStatus,
  WorkerEmploymentType,
  ProficiencyLevel,
} from '@cshrk/types';

export class OnboardWorkerDto {
  @ApiProperty({ description: 'ID of the Primary Labour Cooperative' })
  @IsUUID()
  @IsNotEmpty()
  cooperativeId: string;

  @ApiProperty({ description: 'Full legal name of the worker' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiPropertyOptional({ description: 'Membership badge / ID number' })
  @IsString()
  @IsOptional()
  memberId?: string;

  @ApiPropertyOptional({
    enum: WorkerEmploymentType,
    default: WorkerEmploymentType.MEMBER_WORKER,
  })
  @IsEnum(WorkerEmploymentType)
  @IsOptional()
  employmentType?: WorkerEmploymentType;
}

export class UpdateAvailabilityDto {
  @ApiProperty({
    enum: WorkerAvailabilityStatus,
    description: 'Current real-time operational status',
  })
  @IsEnum(WorkerAvailabilityStatus)
  availabilityStatus: WorkerAvailabilityStatus;
}

export class UpdateLocationDto {
  @ApiProperty({ description: 'Latitude between -90 and 90' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude between -180 and 180' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class AddWorkerSkillDto {
  @ApiProperty({ description: 'UUID of the standardized trade skill' })
  @IsUUID()
  @IsNotEmpty()
  skillId: string;

  @ApiProperty({
    enum: ProficiencyLevel,
    default: ProficiencyLevel.BEGINNER,
  })
  @IsEnum(ProficiencyLevel)
  proficiencyLevel: ProficiencyLevel;
}

export class VerifyWorkerSkillDto {
  @ApiProperty({ description: 'Verification outcome' })
  @IsBoolean()
  isVerified: boolean;
}

export class RespondJobDto {
  @ApiProperty({ enum: ['ACCEPT', 'DECLINE'], description: 'Worker response' })
  @IsEnum(['ACCEPT', 'DECLINE'])
  action: 'ACCEPT' | 'DECLINE';

  @ApiPropertyOptional({ description: 'Optional reason if declining' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class QueryWorkersDto {
  @ApiPropertyOptional({ description: 'Filter by Cooperative UUID' })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;

  @ApiPropertyOptional({ enum: WorkerAvailabilityStatus })
  @IsEnum(WorkerAvailabilityStatus)
  @IsOptional()
  availabilityStatus?: WorkerAvailabilityStatus;

  @ApiPropertyOptional({ description: 'Search by worker name or member ID' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number = 20;
}

export class UpdateWorkerDto {
  @ApiPropertyOptional({ description: 'Full legal name of the worker' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Membership badge / ID number' })
  @IsString()
  @IsOptional()
  memberId?: string;

  @ApiPropertyOptional({ enum: WorkerEmploymentType })
  @IsEnum(WorkerEmploymentType)
  @IsOptional()
  employmentType?: WorkerEmploymentType;

  @ApiPropertyOptional({ description: 'ID of Primary Labour Cooperative' })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;
}

export class UpdateWorkerStatusDto {
  @ApiProperty({ enum: WorkerAvailabilityStatus })
  @IsEnum(WorkerAvailabilityStatus)
  availabilityStatus: WorkerAvailabilityStatus;
}


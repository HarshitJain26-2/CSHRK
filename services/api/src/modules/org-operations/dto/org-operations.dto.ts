import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
  IsNumber,
} from 'class-validator';
import {
  ContractStatus,
  ProjectStatus,
  JobStatus,
  RequirementStatus,
} from '@cshrk/types';

export class CreateContractDto {
  @ApiProperty({ description: 'Contract number', example: 'CNT-2026-002' })
  @IsString()
  @IsNotEmpty()
  contractNumber: string;

  @ApiProperty({ description: 'Contract title', example: 'Hospital Facility Maintenance' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Client organization name', example: 'Delhi State Health Authority' })
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiPropertyOptional({ description: 'Client contact info' })
  @IsOptional()
  @IsString()
  clientContact?: string;

  @ApiPropertyOptional({ description: 'Cooperative society ID' })
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @ApiPropertyOptional({ description: 'Federation ID' })
  @IsOptional()
  @IsUUID()
  federationId?: string;

  @ApiProperty({ description: 'Contract scope' })
  @IsString()
  @IsNotEmpty()
  scope: string;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: ContractStatus, default: ContractStatus.DRAFT })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}

export class UpdateContractStatusDto {
  @ApiProperty({ enum: ContractStatus })
  @IsEnum(ContractStatus)
  status: ContractStatus;
}

export class CreateProjectDto {
  @ApiPropertyOptional({ description: 'Associated contract ID' })
  @IsOptional()
  @IsUUID()
  contractId?: string;

  @ApiProperty({ description: 'Cooperative society ID' })
  @IsUUID()
  cooperativeId: string;

  @ApiProperty({ description: 'Project title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Project description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Address text' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.PLANNING })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

export class CreateLargeJobDto {
  @ApiPropertyOptional({ description: 'Project ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'Cooperative society ID' })
  @IsUUID()
  cooperativeId: string;

  @ApiProperty({ description: 'Job title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Client organization name' })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty({ description: 'Required skill ID' })
  @IsUUID()
  skillId: string;

  @ApiProperty({ description: 'Number of required workers', example: 6 })
  @IsInt()
  @Min(1)
  requiredWorkers: number;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Address text' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.OPEN })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}

export class CreateWorkforceRequirementDto {
  @ApiPropertyOptional({ description: 'Associated contract ID' })
  @IsOptional()
  @IsUUID()
  contractId?: string;

  @ApiPropertyOptional({ description: 'Associated project ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'Required trade skill ID' })
  @IsUUID()
  skillId: string;

  @ApiProperty({ description: 'Number of workers required', example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Deployment city / location', example: 'Delhi' })
  @IsString()
  @IsNotEmpty()
  locationCity: string;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  endDate: string;
}

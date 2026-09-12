import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatus } from '@cshrk/types';

export class CreateCooperativeDto {
  @ApiProperty({ description: 'UUID of apex federation' })
  @IsUUID()
  @IsNotEmpty()
  federationId: string;

  @ApiProperty({ description: 'Name of the primary labour cooperative society' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ description: 'Government registration certificate number' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({ description: 'District of operational jurisdiction' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: 'Official contact email' })
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ enum: AccountStatus, default: AccountStatus.ACTIVE })
  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}

export class UpdateCooperativeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ enum: AccountStatus })
  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}

export class UpdateAffiliationDto {
  @ApiPropertyOptional({ description: 'Target cooperative ID, or null/empty to detach' })
  @IsUUID()
  @IsOptional()
  targetCooperativeId?: string;
}

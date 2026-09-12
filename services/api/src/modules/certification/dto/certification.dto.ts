import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificationStatus } from '../../../database/entities/certification.entity';

export class CreateCertificationDto {
  @ApiProperty({ description: 'UUID of the worker' })
  @IsUUID()
  @IsNotEmpty()
  workerId: string;

  @ApiProperty({ description: 'Certification or license title' })
  @IsString()
  @MinLength(3)
  certificationName: string;

  @ApiProperty({ description: 'Issuing body or regulatory authority' })
  @IsString()
  @IsNotEmpty()
  issuingOrganization: string;

  @ApiProperty({ description: 'Credential or license number' })
  @IsString()
  @IsNotEmpty()
  credentialNumber: string;

  @ApiProperty({ description: 'Issue date (YYYY-MM-DD)' })
  @IsDateString()
  issueDate: string;

  @ApiPropertyOptional({ description: 'Expiry date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ enum: CertificationStatus, default: CertificationStatus.PENDING })
  @IsEnum(CertificationStatus)
  @IsOptional()
  status?: CertificationStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  documentUrl?: string;
}

export class UpdateCertificationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  certificationName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  issuingOrganization?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ enum: CertificationStatus })
  @IsEnum(CertificationStatus)
  @IsOptional()
  status?: CertificationStatus;
}

export class VerifyCertificationDto {
  @ApiProperty({ enum: [CertificationStatus.VALID, CertificationStatus.REJECTED] })
  @IsEnum([CertificationStatus.VALID, CertificationStatus.REJECTED])
  status: CertificationStatus.VALID | CertificationStatus.REJECTED;

  @ApiPropertyOptional({ description: 'Review notes / verification audit trail' })
  @IsString()
  @IsOptional()
  verificationNotes?: string;
}

export class RenewCertificationDto {
  @ApiProperty({ description: 'New extended expiry date (YYYY-MM-DD)' })
  @IsDateString()
  newExpiryDate: string;
}

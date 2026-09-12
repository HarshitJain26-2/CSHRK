import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProficiencyLevel } from '@cshrk/types';

export class CreateSkillDto {
  @ApiProperty({ description: 'Full name of trade skill' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Unique code for standardized skill' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Category e.g. Electrical, Plumbing, Construction' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: 'Description and scope of practice' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSkillDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignSkillDto {
  @ApiProperty({ description: 'UUID of the worker' })
  @IsUUID()
  @IsNotEmpty()
  workerId: string;

  @ApiProperty({ enum: ProficiencyLevel, default: ProficiencyLevel.BEGINNER })
  @IsEnum(ProficiencyLevel)
  proficiencyLevel: ProficiencyLevel;
}

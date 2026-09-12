import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TeamStatus, TeamMemberRole } from '@cshrk/types';

export class CreateTeamDto {
  @ApiProperty({ description: 'Cooperative society ID' })
  @IsUUID()
  cooperativeId: string;

  @ApiProperty({ description: 'Team name', example: 'Rapid Electrical Maintenance Crew' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Team description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Leader worker ID' })
  @IsOptional()
  @IsUUID()
  leaderWorkerId?: string;

  @ApiPropertyOptional({ description: 'Associated project ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}

export class UpdateTeamDto {
  @ApiPropertyOptional({ description: 'Team name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Team description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Leader worker ID' })
  @IsOptional()
  @IsUUID()
  leaderWorkerId?: string;

  @ApiPropertyOptional({ enum: TeamStatus, description: 'Team status' })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;

  @ApiPropertyOptional({ description: 'Associated project ID' })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}

export class AddTeamMemberDto {
  @ApiProperty({ description: 'Worker ID' })
  @IsUUID()
  workerId: string;

  @ApiPropertyOptional({ enum: TeamMemberRole, default: TeamMemberRole.MEMBER })
  @IsOptional()
  @IsEnum(TeamMemberRole)
  role?: TeamMemberRole;
}

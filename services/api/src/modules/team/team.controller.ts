import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto/team.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';

@ApiTags('Worker Teams & Crews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create a new worker crew/team under a cooperative' })
  @ApiResponse({ status: 201, description: 'Team created' })
  async createTeam(@Body() dto: CreateTeamDto, @Request() req: any) {
    return this.teamService.createTeam(dto, req.user);
  }

  @Get()
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List teams for a cooperative society' })
  @ApiResponse({ status: 200, description: 'List of teams' })
  async listTeams(@Query('cooperativeId') cooperativeId: string, @Request() req: any) {
    return this.teamService.listTeams(cooperativeId, req.user);
  }

  @Get(':id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get team details with member roster and skill breakdown' })
  @ApiResponse({ status: 200, description: 'Team details retrieved' })
  async getTeamById(@Param('id') id: string, @Request() req: any) {
    return this.teamService.getTeamById(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update team parameters, leader, or status' })
  @ApiResponse({ status: 200, description: 'Team updated' })
  async updateTeam(
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
    @Request() req: any,
  ) {
    return this.teamService.updateTeam(id, dto, req.user);
  }

  @Post(':id/members')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Assign a worker to the team' })
  @ApiResponse({ status: 201, description: 'Worker added to team' })
  async addTeamMember(
    @Param('id') id: string,
    @Body() dto: AddTeamMemberDto,
    @Request() req: any,
  ) {
    return this.teamService.addTeamMember(id, dto, req.user);
  }

  @Delete(':id/members/:workerId')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Remove a worker from the team' })
  @ApiResponse({ status: 200, description: 'Worker removed from team' })
  async removeTeamMember(
    @Param('id') id: string,
    @Param('workerId') workerId: string,
    @Request() req: any,
  ) {
    await this.teamService.removeTeamMember(id, workerId, req.user);
    return { message: 'Worker removed from team successfully' };
  }
}

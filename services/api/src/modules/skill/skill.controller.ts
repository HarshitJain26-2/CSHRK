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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkillService } from './skill.service';
import { CreateSkillDto, UpdateSkillDto, AssignSkillDto } from './dto/skill.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@cshrk/types';

@ApiTags('Skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create a standardized trade skill' })
  @ApiResponse({ status: 201, description: 'Skill created successfully' })
  async createSkill(@Body() dto: CreateSkillDto) {
    return this.skillService.createSkill(dto);
  }

  @Get()
  @Roles(
    UserRole.WORKER,
    UserRole.CUSTOMER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'List standardized skills' })
  @ApiResponse({ status: 200, description: 'List of skills' })
  async listSkills(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.skillService.listSkills(category, search);
  }

  @Get(':id')
  @Roles(
    UserRole.WORKER,
    UserRole.CUSTOMER,
    UserRole.COOPERATIVE_ADMIN,
    UserRole.FEDERATION_ADMIN,
    UserRole.PLATFORM_ADMIN,
  )
  @ApiOperation({ summary: 'Get skill details by ID' })
  @ApiResponse({ status: 200, description: 'Skill details retrieved' })
  async getSkillById(@Param('id') id: string) {
    return this.skillService.getSkillById(id);
  }

  @Patch(':id')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Update skill parameters' })
  @ApiResponse({ status: 200, description: 'Skill updated' })
  async updateSkill(@Param('id') id: string, @Body() dto: UpdateSkillDto) {
    return this.skillService.updateSkill(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.FEDERATION_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Deactivate / delete skill' })
  @ApiResponse({ status: 200, description: 'Skill removed' })
  async deleteSkill(@Param('id') id: string) {
    return this.skillService.deleteSkill(id);
  }

  @Post(':id/assign')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Assign skill to worker with proficiency level' })
  @ApiResponse({ status: 200, description: 'Skill assigned to worker' })
  async assignSkill(@Param('id') skillId: string, @Body() dto: AssignSkillDto) {
    return this.skillService.assignSkillToWorker(skillId, dto);
  }

  @Delete(':id/assign/:workerId')
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Remove skill assignment from worker' })
  @ApiResponse({ status: 200, description: 'Skill unassigned from worker' })
  async removeSkill(@Param('id') skillId: string, @Param('workerId') workerId: string) {
    return this.skillService.removeSkillFromWorker(skillId, workerId);
  }
}

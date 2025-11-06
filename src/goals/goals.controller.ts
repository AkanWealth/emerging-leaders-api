import { Controller, Post, Get, Delete, Param, Body, UseGuards, Patch, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GoalService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from 'src/types/request-with-user'; 
import { UpdateGoalDto } from './dto/update-goal.dto';

@ApiTags('Goals')
@UseGuards(JwtAuthGuard) // Ensure all goal routes are protected
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalService: GoalService) {}

 @Post()
@ApiOperation({ summary: 'Create a new goal' })
@ApiResponse({ status: 201, description: 'Goal created successfully' })
@ApiResponse({ status: 400, description: 'Invalid input data' })
create(@Req() req: RequestWithUser, @Body() dto: CreateGoalDto) {
  return this.goalService.create(req.user.id, dto); 
}

@Get('search')
@ApiOperation({ summary: 'Search goals by date and project for current user' })
@ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
async searchByDateAndProject(
  @Req() req: RequestWithUser,
  @Query('date') date: string,
  @Query('projectId') projectId: string,
) {
  return this.goalService.findByDateAndProject(req.user.id, date, projectId);
}


  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming goals for the user' })
  async getUpcomingGoals(@Req() req) {
    const userId = req.user.id; // assuming user ID is injected via auth guard
    return this.goalService.getUpcomingGoals(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all goals' })
  @ApiResponse({ status: 200, description: 'List of all goals' })
  findAll() {
    return this.goalService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a goal by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the goal to retrieve' })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  findOne(@Param('id') id: string) {
    return this.goalService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the goal to update' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  update(@Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.goalService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the goal to delete' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  remove(@Param('id') id: string) {
    return this.goalService.remove(id);
  }
}

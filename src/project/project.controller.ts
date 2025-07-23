import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Patch,
  Req,
  Query
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery
} from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { RequestWithUser } from 'src/types/request-with-user'; 

@ApiTags('Projects')
@UseGuards(JwtAuthGuard) // Protect all routes
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

@Post()
@ApiOperation({ summary: 'Create a new project' })
@ApiResponse({ status: 201, description: 'Project created successfully' })
@ApiBody({ type: CreateProjectDto })
create(@Req() req: RequestWithUser, @Body() dto: CreateProjectDto) {
  const user = req.user as { id: string };
  return this.projectService.create(user.id, dto);
}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'List of all projects' })
  findAll() {
    return this.projectService.findAll();
  }

@Get('user-project')
@ApiOperation({ summary: 'Get all project for the current user' })
@ApiResponse({ status: 200, description: 'List of projects' })
findAllUserProject(@Req() req: RequestWithUser) {
  return this.projectService.findAllUserProject(req.user.id); 
}

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the project' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the project to update' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(@Param('id') id: string, @Body() dto: CreateProjectDto) {
    return this.projectService.update(id, dto);
  }
@Delete(':id')
@ApiOperation({ summary: 'Delete a project by ID' })
@ApiParam({ name: 'id', description: 'The ID of the project to delete' })
@ApiQuery({ name: 'force', required: false, type: Boolean, description: 'Force delete even with goals' })
@ApiResponse({ status: 200, description: 'Project deleted successfully' })
@ApiResponse({ status: 404, description: 'Project not found' })
@ApiResponse({ status: 400, description: 'Project has associated goals' })
remove(@Param('id') id: string, @Query('force') force?: boolean) {
  return this.projectService.remove(id, force);
}

}

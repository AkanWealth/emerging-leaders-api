// assessment-category.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AssessmentCategoryService } from './assessment-category.service';
import { CreateAssessmentCategoryDto } from './dto/create-assessment-category.dto';
import { UpdateAssessmentCategoryDto } from './dto/update-assessment-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/decorators/guards/admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Assessment Categories')
@Controller('assessment-categories')
export class AssessmentCategoryController {
  constructor(private service: AssessmentCategoryService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Admin - Create assessment category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(@Body() dto: CreateAssessmentCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assessment categories' })
  @ApiResponse({ status: 200, description: 'List of categories returned successfully' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiResponse({ status: 200, description: 'Category returned successfully' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Admin - Update assessment category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateAssessmentCategoryDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Admin - Delete assessment category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

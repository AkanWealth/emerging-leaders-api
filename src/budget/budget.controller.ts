import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Budget')
@UseGuards(JwtAuthGuard) // Ensure all budget routes are protected
@Controller('budget')
export class BudgetController {
  constructor(private readonly service: BudgetService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully.' })
  create(@Param('userId') userId: string, @Body() dto: CreateBudgetDto) {
    return this.service.create(userId, dto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get all budgets for a user' })
  findAll(@Param('userId') userId: string) {
    return this.service.findAll(userId);
  }

  @Get(':userId/:id')
  @ApiOperation({ summary: 'Get a specific budget by ID' })
  findOne(@Param('userId') userId: string, @Param('id') id: string) {
    return this.service.findOne(id, userId);
  }

  @Patch(':userId/:id')
  @ApiOperation({ summary: 'Update a budget' })
  update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Delete(':userId/:id')
  @ApiOperation({ summary: 'Delete a budget' })
  remove(@Param('userId') userId: string, @Param('id') id: string) {
    return this.service.remove(id, userId);
  }
}

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Expense')
@UseGuards(JwtAuthGuard) // Ensure all expense routes are protected
@Controller('expense')
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully.' })
  create(@Param('userId') userId: string, @Body() dto: CreateExpenseDto) {
    return this.service.create(userId, dto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get all expenses for a user' })
  findAll(@Param('userId') userId: string) {
    return this.service.findAll(userId);
  }

  @Get(':userId/:id')
  @ApiOperation({ summary: 'Get a specific expense by ID' })
  findOne(@Param('userId') userId: string, @Param('id') id: string) {
    return this.service.findOne(id, userId);
  }

  @Patch(':userId/:id')
  @ApiOperation({ summary: 'Update an expense' })
  update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Delete(':userId/:id')
  @ApiOperation({ summary: 'Delete an expense' })
  remove(@Param('userId') userId: string, @Param('id') id: string) {
    return this.service.remove(id, userId);
  }

    @ApiOperation({ summary: 'Get income analytics' })
    @ApiResponse({ status: 200, description: 'Income analytics data' }) 
    @ApiParam({ name: 'filter', required: false, description: 'Filter type (weekly, monthly, yearly)' })
    @ApiQuery({ name: 'filter', required: false, enum: ['weekly', 'monthly', 'yearly'], description: 'Filter type for analytics' })
    @Get('analytics')
    getIncomeAnalytics(
      @Query('filter') filter: 'weekly' | 'monthly' | 'yearly' = 'monthly',
      @Req() req: any,
    ) {
      const userId = req.user.id;
      return this.service.getExpenseAnalytics(userId, filter);
    }
}

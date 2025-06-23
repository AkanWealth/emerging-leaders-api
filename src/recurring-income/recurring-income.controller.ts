

import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecurringIncomeService } from './recurring-income.service';
import { CreateRecurringIncomeDto } from './dto/create-recurring-income.dto';
import { UpdateRecurringIncomeDto } from './dto/update-recurring-income.dto';

@ApiTags('Recurring Income')
@Controller('recurring-income')
export class RecurringIncomeController {
  constructor(private readonly service: RecurringIncomeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recurring income' })
  create(@Body() dto: CreateRecurringIncomeDto) {
    return this.service.create(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all recurring incomes by user' })
  findAll(@Param('userId') userId: string) {
    return this.service.findAllByUser(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recurring income' })
  update(@Param('id') id: string, @Body() dto: UpdateRecurringIncomeDto) {
    return this.service.update(id, dto);
  }

  @Get('logs/income/:incomeId')
getLogsByIncome(@Param('incomeId') id: string) {
  return this.service.getCreditLogsByIncome(id);
}

@Get('logs/income/:userId')
@ApiOperation({ summary: 'Get credit logs by user ID' })
getLogsByUser(@Param('userId') id: string) {
  return this.service.getCreditLogsByUser(id);
}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recurring income' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

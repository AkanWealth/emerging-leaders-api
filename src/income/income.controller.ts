import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Req,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Income')
@ApiBearerAuth()
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new income entry' })
  @ApiResponse({ status: 201, description: 'Income created successfully' })
  @ApiBody({ type: CreateIncomeDto })
  create(@Req() req, @Body() dto: CreateIncomeDto) {
    return this.incomeService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all income entries for a user' })
  @ApiResponse({ status: 200, description: 'List of income entries' })
  findAll(@Req() req) {
    return this.incomeService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single income entry by ID' })
  @ApiResponse({ status: 200, description: 'Income entry found' })
  @ApiParam({ name: 'id', required: true })
  findOne(@Req() req, @Param('id') id: string) {
    return this.incomeService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an income entry' })
  @ApiResponse({ status: 200, description: 'Income updated successfully' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateIncomeDto })
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateIncomeDto) {
    return this.incomeService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an income entry' })
  @ApiResponse({ status: 200, description: 'Income deleted successfully' })
  @ApiParam({ name: 'id', required: true })
  remove(@Req() req, @Param('id') id: string) {
    return this.incomeService.remove(id, req.user.id);
  }
}

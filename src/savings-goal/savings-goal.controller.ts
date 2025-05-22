import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SavingsGoalService } from './savings-goal.service';
import { CreateSavingsGoalDto} from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';

@ApiBearerAuth()
@ApiTags('savings-goals')
@UseGuards(JwtAuthGuard)
@Controller('savings-goals')
export class SavingsGoalController {
  constructor(private readonly savingsGoalService: SavingsGoalService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateSavingsGoalDto) {
    return this.savingsGoalService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.savingsGoalService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.savingsGoalService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateSavingsGoalDto) {
    return this.savingsGoalService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.savingsGoalService.remove(id, req.user.id);
  }
}

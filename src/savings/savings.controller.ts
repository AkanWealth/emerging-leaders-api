import {
  Controller,
  Post,
  Get,
  Body,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CreateSavingsDto } from './dto/create-savings.dto';
import { TopupSavingsDto } from './dto/topup-savings.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Savings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Post('goal')
  @ApiOperation({ summary: 'Create a savings goal' })
  async createGoal(@Req() req, @Body() dto: CreateSavingsDto) {
    return this.savingsService.createGoal(req.user.id, dto);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get all savings goals' })
  async getGoals(@Req() req) {
    return this.savingsService.getGoals(req.user.id);
  }

  @Post('top-up')
  @ApiOperation({ summary: 'Top up a savings goal' })
  async topUp(@Req() req, @Body() dto: TopupSavingsDto) {
    return this.savingsService.topUp(req.user.id, dto);
  }

  @Delete(':goalId')
  @ApiOperation({ summary: 'Delete a savings goal' })
  async deleteGoal(@Req() req, @Param('goalId') goalId: string) {
    return this.savingsService.deleteGoal(req.user.id, goalId);
  }
}

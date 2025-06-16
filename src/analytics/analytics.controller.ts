// src/analytics/analytics.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AnalyticsOverviewDto } from './dto/analytics-response.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get income, expenses, and budget analytics' })
  @ApiQuery({ name: 'userId', required: true, description: 'User UUID' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['weekly', 'monthly', 'yearly'],
    description: 'Time filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics overview fetched successfully',
    type: AnalyticsOverviewDto,
  })
  getOverview(
    @Query('userId') userId: string,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' = 'monthly',
  ) {
    return this.analyticsService.getOverview(userId, period);
  }
}

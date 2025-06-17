import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AnalyticsOverviewDto } from './dto/analytics-response.dto';
import { AdminGuard } from '../common/decorators/guards/admin.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // EXISTING USER ANALYTICS
  @Get('overview')
  @ApiOperation({ summary: 'Get income, expenses, and budget analytics' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'period', enum: ['weekly', 'monthly', 'yearly'], required: false })
  @ApiResponse({ status: 200, type: AnalyticsOverviewDto })
  getOverview(
    @Query('userId') userId: string,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' = 'monthly',
  ) {
    return this.analyticsService.getOverview(userId, period);
  }

  // === ADMIN ANALYTICS ===

  @Get('admin/user-stats')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - User statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns total, new, active users with growth rate' })
  getUserStats() {
    return this.analyticsService.getUserStats();
  }

  @Get('admin/user-growth-chart')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - Monthly user registration trend' })
  @ApiResponse({ status: 200, description: 'Returns user growth data for line chart' })
  getUserGrowthChart() {
    return this.analyticsService.getMonthlyUserGrowthChart();
  }

  @Get('admin/recent-activities')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, description: 'Number of activities to return' })
  @ApiOperation({ summary: 'Admin - Recent user activities' })
  @ApiResponse({ status: 200, description: 'Recent user actions' })
  getRecentActivities(@Query('limit') limit = 10) {
    return this.analyticsService.getRecentActivities(limit);
  }

  @Get('admin/leaderboard')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - User leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard of top users' })
  getLeaderboard() {
    return this.analyticsService.getLeaderboard();
  }
}

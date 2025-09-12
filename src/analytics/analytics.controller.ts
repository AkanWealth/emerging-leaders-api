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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ReqDecorator } from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // === USER ANALYTICS ===
  @UseGuards(JwtAuthGuard)
  @Get('overview')
  @ApiOperation({ summary: 'Get income, expenses, and budget analytics' })
  @ApiQuery({ name: 'period', enum: ['weekly', 'monthly', 'yearly'], required: false })
  @ApiResponse({ status: 200, type: AnalyticsOverviewDto })
  getOverview(
    @ReqDecorator() req: RequestWithUser,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' = 'monthly',
  ) {
    const userId = req.user.id; // ✅ Extract from JWT
    return this.analyticsService.getOverview(userId, period);
  }

  // === ADMIN ANALYTICS ===
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/user-stats')
  @ApiOperation({ summary: 'Admin - User statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns total, new, active users with growth rate' })
  getUserStats() {
    return this.analyticsService.getUserStats();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/user-growth-chart')
  @ApiOperation({ summary: 'Admin - Monthly user registration trend' })
  @ApiResponse({ status: 200, description: 'Returns user growth data for line chart' })
  getUserGrowthChart() {
    return this.analyticsService.getMonthlyUserGrowthChart();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/recent-activities')
  @ApiQuery({ name: 'limit', required: false, description: 'Number of activities to return' })
  @ApiOperation({ summary: 'Admin - Recent user activities' })
  @ApiResponse({ status: 200, description: 'Recent user actions' })
  getRecentActivities(@Query('limit') limit = 10) {
    return this.analyticsService.getRecentActivities(limit);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/leaderboard')
  @ApiOperation({ summary: 'Admin - User leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard of top users' })
  getLeaderboard(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.analyticsService.getLeaderboard(Number(page), Number(limit));
  }

}

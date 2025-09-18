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
    const userId = req.user.id; //  Extract from JWT
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

@Get('user-growth-chart')
@ApiOperation({ summary: 'Admin - User registration growth trend' })
@ApiResponse({ status: 200, description: 'Returns user growth data for line chart' })
getUserGrowthChart(@Query('period') period?: string) {
  console.log(`Received period: ${period}`);
  const allowed: Array<'7d' | '30d' | '12m'> = ['7d', '30d', '12m'];
  const validPeriod = allowed.includes(period as any) ? (period as '7d' | '30d' | '12m') : '12m';
  return this.analyticsService.getUserGrowthChart(validPeriod);
}


  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/recent-activities')
  @ApiQuery({ name: 'limit', required: false, description: 'Number of activities to return' })
  @ApiOperation({ summary: 'Admin - Recent user activities' })
  @ApiResponse({ status: 200, description: 'Recent user actions' })
  getRecentActivities(@Query('limit') limit = 10) {
    return this.analyticsService.getRecentActivities(limit);
  }

// @Get('admin/leaderboard')
// @UseGuards(JwtAuthGuard, AdminGuard)
// @ApiOperation({ summary: 'Get leaderboard data' })
// @ApiResponse({ status: 200, description: 'Leaderboard data returned successfully' })
// @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
// @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 20)' })
// @ApiQuery({ name: 'search', required: false, type: String, description: 'Search keyword' })
// @ApiQuery({ name: 'ranking', required: false, enum: ['lowest', 'highest'], description: 'Ranking order' })
// @ApiQuery({ name: 'completed', required: false, type: String, description: 'Filter by completed tasks' })
// @ApiQuery({ name: 'goals', required: false, type: String, description: 'Filter by goals' })
// @ApiQuery({ name: 'streak', required: false, type: String, description: 'Filter by streak' })
// async getLeaderboard(
//   @Query('page') page = 1,
//   @Query('limit') limit = 20,
//   @Query('search') search?: string,
//   @Query('ranking') ranking?: 'lowest' | 'highest',
//   @Query('completed') completed?: string,
//   @Query('goals') goals?: string,
//   @Query('streak') streak?: string,
// ) {
//   return this.analyticsService.getLeaderboard({
//     page: Number(page),
//     limit: Number(limit),
//     search,
//     ranking,
//     completed,
//     goals,
//     streak,
//   });
// }

  @Get('admin/leaderboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get leaderboard data' })
  @ApiResponse({ status: 200, description: 'Leaderboard data returned successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search keyword' })
  @ApiQuery({ name: 'ranking', required: false, enum: ['lowest', 'highest'], description: 'Ranking order' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Column to sort by (e.g., completed, goals, streak, projects, savings, budget, name)' })
  @ApiQuery({ name: 'completed', required: false, type: String, description: 'Filter by completed tasks (e.g., lessThan5, moreThan10)' })
  @ApiQuery({ name: 'goals', required: false, type: String, description: 'Filter by goals' })
  @ApiQuery({ name: 'streak', required: false, type: String, description: 'Filter by streak' })
  @ApiQuery({ name: 'projects', required: false, type: String, description: 'Filter by total projects' })
  @ApiQuery({ name: 'savings', required: false, type: String, description: 'Filter by savings amount' })
  @ApiQuery({ name: 'budget', required: false, type: String, description: 'Filter by budget amount' })
  async getLeaderboard(
    @Query() query: Record<string, string | undefined>,
  ) {
    return this.analyticsService.getLeaderboard(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('growth')
  async getGrowth() {
    return this.analyticsService.getMonthlyGrowthChart();
  }

}

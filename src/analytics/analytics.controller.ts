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
@ApiOperation({ summary: 'Get leaderboard data with flexible filtering and sorting' })
@ApiResponse({ status: 200, description: 'Leaderboard data returned successfully' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page (default: 20)' })
@ApiQuery({ name: 'search', required: false, type: String, example: 'john', description: 'Search by firstname, lastname, or email' })
@ApiQuery({ name: 'ranking', required: false, enum: ['lowest', 'highest'], example: 'highest', description: 'Order of ranking (default: highest)' })
@ApiQuery({ name: 'sortBy', required: false, enum: ['completed', 'goals', 'streak', 'projects', 'savings', 'budget', 'name'], example: 'streak', description: 'Field to sort by (default: streak)' })

// Numeric filters — expose the min/max pairs clearly:
@ApiQuery({ name: 'completedMin', required: false, type: Number, example: 5, description: 'Minimum number of completed goals' })
@ApiQuery({ name: 'completedMax', required: false, type: Number, example: 50, description: 'Maximum number of completed goals' })
@ApiQuery({ name: 'goalsMin', required: false, type: Number, example: 10, description: 'Minimum number of goals' })
@ApiQuery({ name: 'goalsMax', required: false, type: Number, example: 100, description: 'Maximum number of goals' })
@ApiQuery({ name: 'streakMin', required: false, type: Number, example: 3, description: 'Minimum streak value' })
@ApiQuery({ name: 'streakMax', required: false, type: Number, example: 30, description: 'Maximum streak value' })
@ApiQuery({ name: 'savingsMin', required: false, type: Number, example: 5000, description: 'Minimum savings amount' })
@ApiQuery({ name: 'savingsMax', required: false, type: Number, example: 50000, description: 'Maximum savings amount' })
@ApiQuery({ name: 'projectsMin', required: false, type: Number, example: 1, description: 'Minimum number of projects' })
@ApiQuery({ name: 'projectsMax', required: false, type: Number, example: 20, description: 'Maximum number of projects' })
@ApiQuery({ name: 'budgetMin', required: false, type: Number, example: 1000, description: 'Minimum budget limit' })
@ApiQuery({ name: 'budgetMax', required: false, type: Number, example: 50000, description: 'Maximum budget limit' })
async getLeaderboard(@Query() query: Record<string, string | undefined>) {
  return this.analyticsService.getLeaderboard(query);
}


  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('growth')
  async getGrowth() {
    return this.analyticsService.getMonthlyGrowthChart();
  }

}

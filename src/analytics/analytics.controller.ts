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

  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @Get('admin/user-growth-chart')
  // @ApiOperation({ summary: 'Admin - Monthly user registration trend' })
  // @ApiResponse({ status: 200, description: 'Returns user growth data for line chart' })
  // getUserGrowthChart() {
  //   return this.analyticsService.getMonthlyUserGrowthChart();
  // }

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

//   @UseGuards(JwtAuthGuard, AdminGuard)
// @Get('admin/leaderboard')
// @ApiOperation({ summary: 'Admin - User leaderboard' })
// @ApiResponse({ status: 200, description: 'Leaderboard of top users' })
// getLeaderboard(
//   @Query('page') page = 1,
//   @Query('limit') limit = 20,
//   @Query('search') search?: string,
//   @Query('filterBy') filterBy?: 'projects' | 'goals' | 'savings' | 'budget' | 'streak',
// ) {
//   return this.analyticsService.getLeaderboard(Number(page), Number(limit), search, filterBy);
// }

@Get('admin/leaderboard')
@UseGuards(JwtAuthGuard, AdminGuard)
async getLeaderboard(
  @Query('page') page = 1,
  @Query('limit') limit = 20,
  @Query('search') search?: string,
  @Query('ranking') ranking?: 'lowest' | 'highest',
  @Query('completed') completed?: string,
  @Query('goals') goals?: string,
  @Query('streak') streak?: string,
) {
  return this.analyticsService.getLeaderboard({
    page: Number(page),
    limit: Number(limit),
    search,
    ranking,
    completed,
    goals,
    streak,
  });
}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('growth')
  async getGrowth() {
    return this.analyticsService.getMonthlyGrowthChart();
  }

}

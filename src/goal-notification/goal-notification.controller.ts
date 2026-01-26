import { Controller, Get, Req } from '@nestjs/common';
import { GoalNotificationService } from './goal-notification.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';    


@ApiBearerAuth()
@ApiTags('Goal Notification')
@UseGuards(JwtAuthGuard)
@Controller('goal-notification')
export class GoalNotificationController {
  constructor(private readonly goalNotificationService: GoalNotificationService) {}

  /** Fetch one message per goal/project for today */
  @Get('today')
  async getTodayMessages(@Req() req) {
    const userId = req.user.id; // assuming auth guard sets req.user
    const messages = await this.goalNotificationService.getTodayMessages(userId);
    return messages;
  }
}

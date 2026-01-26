import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { BudgetNotificationService } from './budget-notification.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Budget Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budget-notifications')
export class BudgetNotificationController {
  constructor(private readonly service: BudgetNotificationService) {}

  // Fetch today's messages (one per event)
    @Get('today')
    @UseGuards(JwtAuthGuard)
    async getToday(@Req() req) {
      return this.service.getTodayMessages(req.user.id);
    }


  // Fetch unread notifications
  @Get('unread/:userId')
  async getUnread(@Param('userId') userId: string) {
    return this.service.fetchUnread(userId);
  }

  // Mark a notification as read
  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}

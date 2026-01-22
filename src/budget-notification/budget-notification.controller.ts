import { Controller, Get, Param, Patch } from '@nestjs/common';
import { BudgetNotificationService } from './budget-notification.service';

@Controller('budget-notifications')
export class BudgetNotificationController {
  constructor(private readonly service: BudgetNotificationService) {}

  // Fetch today's messages (one per event)
  @Get('today/:userId')
  async getToday(@Param('userId') userId: string) {
    return this.service.getTodayMessages(userId);
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

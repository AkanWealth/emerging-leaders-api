import { Controller, Get, Param, Patch } from '@nestjs/common';
import { BudgetNotificationService } from './budget-notification.service';

@Controller('budget-notifications')
export class BudgetNotificationController {
  constructor(private readonly service: BudgetNotificationService) {}

  // fetch unread notifications for a user
  @Get('unread/:userId')
  async getUnread(@Param('userId') userId: string) {
    return this.service.fetchUnread(userId);
  }

  // mark a notification as read (clicked)
  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}

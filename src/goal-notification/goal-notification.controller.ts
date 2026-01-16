import { Controller, Get, Param, Patch } from '@nestjs/common';
import { GoalNotificationService } from './goal-notification.service';

@Controller('goal-notifications')
export class GoalNotificationController {
  constructor(private readonly service: GoalNotificationService) {}

  @Get('unread/:userId')
  async getUnread(@Param('userId') userId: string) {
    return this.service.fetchUnread(userId);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetNotificationService {
  constructor(private prisma: PrismaService) {}

  // fetch unread notifications for frontend
  async fetchUnread(userId: string) {
    return this.prisma.budgetNotification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  // mark a notification as read
  async markAsRead(id: string) {
    return this.prisma.budgetNotification.update({
      where: { id },
      data: { read: true },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalNotificationService {
  constructor(private prisma: PrismaService) {}

  async fetchUnread(userId: string) {
    return this.prisma.goalNotification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.goalNotification.update({
      where: { id },
      data: { read: true },
    });
  }

  async create(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    goalId?: string;
    projectId?: string;
  }) {
    return this.prisma.goalNotification.create({ data });
  }
}

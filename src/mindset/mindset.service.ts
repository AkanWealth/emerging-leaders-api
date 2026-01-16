import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MindsetService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  /** Get all cards for a group */
  async getGroupCards(groupName: string) {
    return this.prisma.mindsetItem.findMany({
      where: { group: { name: groupName } },
      orderBy: { order: 'asc' },
    });
  }

  /** Pick the next card for a user respecting intervals */
  async getNextCardForUser(userId: string, groupName: string) {
    const group = await this.prisma.mindsetGroup.findUnique({
      where: { name: groupName },
      include: { items: true },
    });
    if (!group || group.items.length === 0) return null;

    // find last card sent to this user in this group
    const lastSent = await this.prisma.userMindsetProgress.findFirst({
      where: { userId, groupId: group.id },
      orderBy: { createdAt: 'desc' },
    });

    // Check interval
    if (lastSent) {
      const nextSendTime = new Date(
        lastSent.createdAt.getTime() + group.intervalDays * 24 * 60 * 60 * 1000
      );
      if (nextSendTime > new Date()) {
        // Not time yet
        return null;
      }
    }

    // Filter out cards sent within the interval
    const intervalAgo = new Date();
    intervalAgo.setDate(intervalAgo.getDate() - group.intervalDays);

    const recentCards = await this.prisma.userMindsetProgress.findMany({
      where: {
        userId,
        groupId: group.id,
        createdAt: { gte: intervalAgo },
      },
      select: { cardId: true },
    });
    const recentCardIds = recentCards.map(c => c.cardId);
    let availableCards = group.items.filter(c => !recentCardIds.includes(c.id));

    if (availableCards.length === 0) {
      // fallback: all cards available if interval blocks all
      availableCards = group.items;
    }

    // pick random card
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    return availableCards[randomIndex];
  }

  /** Send a card notification to a user */
  async sendCardToUser(userId: string, groupName: string) {
    const card = await this.getNextCardForUser(userId, groupName);
    if (!card) return; // Not time yet or no cards

    await this.notificationsService.sendToUser(
      'SYSTEM',
      userId,
      `Your ${groupName} Thought`,
      card.text,
      { type: 'MINDSET', group: groupName, cardId: card.id },
      'MINDSET'
    );

    await this.prisma.userMindsetProgress.create({
      data: {
        userId,
        groupId: card.groupId,
        cardId: card.id,
      },
    });
  }

  /** Cron job: check every day at 9am if a card should be sent */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendScheduledMindsets() {
    const users = await this.prisma.user.findMany();
    const groups = await this.prisma.mindsetGroup.findMany();

    for (const user of users) {
      for (const group of groups) {
        await this.sendCardToUser(user.id, group.name);
      }
    }
  }
}

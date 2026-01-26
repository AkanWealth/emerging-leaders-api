import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MindsetService {
  constructor(private prisma: PrismaService) {}

  /** Get all cards for a group */
  async getGroupCards(groupName: string) {
    return this.prisma.mindsetItem.findMany({
      where: { group: { name: groupName } },
      orderBy: { order: 'asc' },
    });
  }

  /** Get next sequential card (1 per day per group) */
  private async getNextSequentialCard(userId: string, groupId: string) {
    const group = await this.prisma.mindsetGroup.findUnique({
      where: { id: groupId },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    if (!group || group.items.length === 0) return null;

    const last = await this.prisma.userMindsetProgress.findFirst({
      where: { userId, groupId },
      orderBy: { createdAt: 'desc' },
    });

    // Enforce one per day
    if (last) {
      const nextAllowed = new Date(last.createdAt);
      nextAllowed.setDate(nextAllowed.getDate() + 1);
      if (new Date() < nextAllowed) return null;

      const lastIndex = group.items.findIndex(i => i.id === last.cardId);
      const nextIndex = (lastIndex + 1) % group.items.length;
      return group.items[nextIndex];
    }

    return group.items[0];
  }

  /** Daily job: advance progress only (no notifications) */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
async advanceMindsets() {
  const users = await this.prisma.user.findMany();
  const groups = await this.prisma.mindsetGroup.findMany({
    orderBy: { order: 'asc' },
  });

  for (const user of users) {
    // find current active group
    let activeGroup: typeof groups[number] | null = null;

    for (const group of groups) {
      const first = await this.prisma.userMindsetProgress.findFirst({
        where: { userId: user.id, groupId: group.id },
        orderBy: { createdAt: 'asc' },
      });

      if (!first) {
        activeGroup = group;
        break;
      }

      const cycleEnd = new Date(first.createdAt);
      cycleEnd.setDate(cycleEnd.getDate() + group.intervalDays);

      if (new Date() <= cycleEnd) {
        activeGroup = group;
        break;
      }
    }

    if (!activeGroup) continue;

    const card = await this.getNextSequentialCard(user.id, activeGroup.id);
    if (!card) continue;

    await this.prisma.userMindsetProgress.create({
      data: {
        userId: user.id,
        groupId: activeGroup.id,
        cardId: card.id,
      },
    });
  }
}


  /** What the frontend uses for popup */
  
  async getTodayCards(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.prisma.userMindsetProgress.findFirst({
    where: {
      userId,
      createdAt: { gte: today },
    },
    include: {
      card: true,
      group: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

}

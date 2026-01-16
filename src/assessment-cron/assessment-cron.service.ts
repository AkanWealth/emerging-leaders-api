import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AssessmentCronService {
  private readonly intervalsInMonths = [1, 3, 6]; // The recurring pattern

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendHourlyAssessmentNotifications() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Get user assessments scheduled for today (nextScheduledFor)
    const userAssessments = await this.prisma.userAssessment.findMany({
      where: {
        nextScheduledFor: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        assessment: true,
      },
    });

    if (!userAssessments.length) return;

    const systemSenderId = 'SYSTEM'; // system notifications sender
for (const ua of userAssessments) {
  if (!ua.nextScheduledFor) continue; // skip if schedule is not set

  // Check if already sent
  const alreadySent = await this.prisma.notification.findFirst({
    where: {
      type: 'ASSESSMENT',
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      data: {
        path: ['userAssessmentId'],
        equals: ua.id,
      },
    },
  });

  if (alreadySent) continue;

  await this.notificationsService.broadcastNotification(
    systemSenderId,
    '📘 Assessment Reminder',
    `Your assessment "${ua.assessment.title}" is scheduled for today at ${ua.nextScheduledFor.toLocaleTimeString()}.`,
    {
      userAssessmentId: ua.id,
      assessmentId: ua.assessmentId,
      scheduledFor: ua.nextScheduledFor.toISOString(),
    },
    'ASSESSMENT',
  );

  const nextIntervalIndex = ua.intervalIndex ?? 0;
  const nextDate = new Date(ua.nextScheduledFor); // safe now
  nextDate.setMonth(nextDate.getMonth() + this.intervalsInMonths[nextIntervalIndex]);

  await this.prisma.userAssessment.update({
    where: { id: ua.id },
    data: {
      nextScheduledFor: nextDate,
      intervalIndex: (nextIntervalIndex + 1) % this.intervalsInMonths.length,
    },
  });
}

  }
}

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AssessmentCronService {
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

    // Get assessments for today only
    const assessments = await this.prisma.assessment.findMany({
      where: {
        scheduledFor: {
          gte: now,
          lte: endOfDay,
        },
        status: 'OPEN',
      },
    });

    if (!assessments.length) return;

    for (const assessment of assessments) {
      // Check if a reminder already exists for this assessment today
      const alreadySent = await this.prisma.notification.findFirst({
        where: {
          type: 'ASSESSMENT',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          // JSON filter for Postgres
          data: {
            equals: {
              assessmentId: assessment.id,
            },
          },
        },
      });

      if (alreadySent) continue; // skip if already sent

      // Send the reminder
      await this.notificationsService.broadcastNotification(
        'Assessment Today',
        `An assessment is scheduled for today at ${assessment.scheduledFor.toLocaleTimeString()}`,
        {
          assessmentId: assessment.id,
          scheduledFor: assessment.scheduledFor.toISOString(),
        },
        'ASSESSMENT',
      );
    }
  }
}

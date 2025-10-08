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

    // Get assessments scheduled for today (and still open)
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

    // System notifications use a "system" sender (null or a special ID)
    // If you have a system user in DB, use that user’s ID; otherwise keep null
    const systemSenderId = 'SYSTEM'; // or leave as `undefined` if not in DB

    for (const assessment of assessments) {
      // Check if a reminder has already been sent today for this assessment
      const alreadySent = await this.prisma.notification.findFirst({
        where: {
          type: 'ASSESSMENT',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          data: {
            // ✅ Safer JSON filtering
            path: ['assessmentId'],
            equals: assessment.id,
          },
        },
      });

      if (alreadySent) continue; // skip if already sent

      // ✅ Send broadcast notification (now includes senderId)
      await this.notificationsService.broadcastNotification(
        systemSenderId,
        '📘 Assessment Reminder',
        `An assessment is scheduled for today at ${assessment.scheduledFor.toLocaleTimeString()}.`,
        {
          assessmentId: assessment.id,
          scheduledFor: assessment.scheduledFor.toISOString(),
        },
        'ASSESSMENT',
      );
    }
  }
}

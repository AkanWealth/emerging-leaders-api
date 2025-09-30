import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserStatusScheduler {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkInactiveUsers() {
    const THRESHOLD = 30; // days of inactivity
    const WARN_DAYS = 25; // warn before deactivation

    const now = new Date();

    // Find users inactive for 30+ days
    const inactiveCandidates = await this.prisma.user.findMany({
      where: {
        lastLogin: {
          lt: new Date(now.getTime() - THRESHOLD * 24 * 60 * 60 * 1000),
        },
        status: 'ACTIVE',
      },
    });

    for (const user of inactiveCandidates) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'INACTIVE' },
      });

      await this.mailService.sendInactivityNotice(
        user.email,
        'Your account has been set to inactive.',
      );
    }

    // Find users to warn at 25 days
    const warningCandidates = await this.prisma.user.findMany({
      where: {
        lastLogin: {
          lt: new Date(now.getTime() - WARN_DAYS * 24 * 60 * 60 * 1000),
        },
        status: 'ACTIVE',
      },
    });

    for (const user of warningCandidates) {
      await this.mailService.sendInactivityWarning(
        user.email,
        'Your account will soon be inactive. Please log in.',
      );
    }
  }
}

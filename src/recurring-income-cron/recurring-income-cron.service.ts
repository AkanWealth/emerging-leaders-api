import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class RecurringIncomeCronService {
  private readonly logger = new Logger(RecurringIncomeCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRecurringIncomeCredit() {
    this.logger.log('Running recurring income cron job...');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const incomes = await this.prisma.recurringIncome.findMany({
      where: { isActive: true },
      include: {
        wallet: true,
        currency: true,
        user: true,
        logs: true,
      },
    });

    for (const income of incomes) {
      const alreadyCredited = income.logs.some(
        (log) => log.creditedAt.toISOString().startsWith(todayStr),
      );

      if (alreadyCredited) continue;
      if (!income.walletId) {
        this.logger.warn(`Skipping income ${income.id}: missing walletId`);
        continue;
      }
      if (!income.user || !income.user.email) {
        this.logger.warn(`Skipping income ${income.id}: missing user or email`);
        continue;
      }
      if (!income.currency) {
        this.logger.warn(`Skipping income ${income.id}: missing currency`);
        continue;
      }

      if (this.isDueToday(income.startDate, income.frequency, today)) {
        // 1️⃣ Credit wallet
        await this.prisma.wallet.update({
          where: { id: income.walletId },
          data: { balance: { increment: income.amount } },
        });

        // 2️⃣ Log the transaction
        await this.prisma.recurringIncomeLog.create({
          data: { recurringIncomeId: income.id },
        });

        // 3️⃣ Send user notification
        await this.sendIncomeNotification(income.user.email, {
          amount: income.amount.toLocaleString(),
          currency: income.currency.symbol,
          type: income.type.toLowerCase(),
          frequency: income.frequency.toLowerCase(),
        });

        this.logger.log(
          `Credited ${income.amount} (${income.frequency}) to user ${income.user.email}`,
        );
      }
    }
  }

  private isDueToday(startDate: Date, frequency: string, today: Date): boolean {
    switch (frequency) {
      case 'DAILY':
        return true;
      case 'MONTHLY':
        return today.getDate() === startDate.getDate();
      case 'YEARLY':
        return (
          today.getDate() === startDate.getDate() &&
          today.getMonth() === startDate.getMonth()
        );
      default:
        return false;
    }
  }

  private async sendIncomeNotification(
    to: string,
    data: { amount: string; currency: string; type: string; frequency: string },
  ) {
    try {
      await this.mailService.sendEmailWithTemplate(to, 40502898, {
        amount: `${data.currency}${data.amount}`,
        frequency: data.frequency,
        type: data.type,
      });
    } catch (error) {
      this.logger.error(`Failed to send income notification to ${to}`, error);
    }
  }
}

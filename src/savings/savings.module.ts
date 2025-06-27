import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { ActivityLogService } from 'src/activity-log/activity-log.service';

@Module({
  imports: [
    PrismaModule,  // ✅ Provides PrismaService
    MailModule,    // ✅ Provides MailService for notifications
  ],
  controllers: [SavingsController],
  providers: [SavingsService, ActivityLogService],
})
export class SavingsModule {}

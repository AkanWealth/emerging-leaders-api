import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MindsetService } from './mindset.service';
import { MindsetController } from './mindset.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [MindsetService, PrismaService, NotificationsService],
  controllers: [MindsetController],
})
export class MindsetModule {}

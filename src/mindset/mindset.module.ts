import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MindsetService } from './mindset.service';
import { MindsetController } from './mindset.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [MindsetService,  NotificationsService],
  controllers: [MindsetController],
})
export class MindsetModule {}

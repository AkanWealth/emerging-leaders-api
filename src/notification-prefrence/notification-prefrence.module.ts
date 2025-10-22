import { Module } from '@nestjs/common';
import { NotificationPreferencesService} from './notification-prefrence.service';
import { NotificationPreferencesController } from './notification-prefrence.controller';

@Module({
  providers: [NotificationPreferencesService],
  controllers: [NotificationPreferencesController],
  exports: [NotificationPreferencesService], 
})
export class NotificationPrefrenceModule {}

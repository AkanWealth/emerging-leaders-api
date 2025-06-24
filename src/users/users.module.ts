import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule, NotificationsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],  // <=== VERY important to export it
})
export class UsersModule {}

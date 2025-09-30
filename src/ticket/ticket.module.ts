import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { AdminGuard } from '../common/decorators/guards/admin.guard'; 
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MailModule } from 'src/mail/mail.module'; 

@Module({
  imports: [
    MailModule, 
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }), 
  ],
  controllers: [TicketController],
  providers: [
    TicketService,
    JwtStrategy,
    AdminGuard,
    ActivityLogService,
    NotificationsService,
  ],
})
export class TicketModule {}

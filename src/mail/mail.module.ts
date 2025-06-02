import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule],  // <-- this is key!
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

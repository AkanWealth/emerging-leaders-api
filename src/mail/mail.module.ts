import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],   // <-- Make sure MailService is here
  exports: [MailService],     // <-- And exported so other modules can use it
})
export class MailModule {}

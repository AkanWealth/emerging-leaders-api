import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [AuthModule, UsersModule, MailModule],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, PrismaService, MailService],
})
export class AppModule {}

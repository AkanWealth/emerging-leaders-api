import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { NotificationPrefrenceModule } from '../notification-prefrence/notification-prefrence.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3d' },
    }),
    MailModule,
    UsersModule,
    NotificationPrefrenceModule, 
  ],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';  // relative path

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    MailModule,
    UsersModule,   // <== import the module that exports UsersService
  ],
  providers: [AuthService, GoogleStrategy],  // no need to add UsersService here
  controllers: [AuthController],
})
export class AuthModule {}

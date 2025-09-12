// admin.module.ts
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    JwtModule.register({   //  Important!
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, MailService],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { CategoryModule } from './category/category.module';
import { GoalsModule } from './goals/goals.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MailModule,
    PrismaModule,
    ProjectModule,
    CategoryModule,
    GoalsModule,
  ],
  controllers: [AppController], // Only controllers here that don't belong to other modules
  providers: [AppService],      // Same with providers
})
export class AppModule {}

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
import { ProjectService } from './project/project.service';
import { ProjectModule } from './project/project.module';
import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';
import { CategoryModule } from './category/category.module';
import { GoalsModule } from './goals/goals.module';

@Module({
  imports: [AuthModule, UsersModule, MailModule, ProjectModule, CategoryModule, GoalsModule],
  controllers: [AppController, AuthController, CategoryController],
  providers: [AppService, AuthService, PrismaService, MailService, ProjectService, CategoryService],
})
export class AppModule {}

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
import { IncomeService } from './income/income.service';
import { IncomeController } from './income/income.controller';
import { IncomeModule } from './income/income.module';
import { SavingsGoalModule } from './savings-goal/savings-goal.module';
import { BudgetController } from './budget/budget.controller';
import { BudgetService } from './budget/budget.service';
import { BudgetModule } from './budget/budget.module';
import { ExpenseModule } from './expense/expense.module';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { AdminUserService } from './admin-user/admin-user.service';
import { AdminUserController } from './admin-user/admin-user.controller';
import { AdminUserModule } from './admin-user/admin-user.module';
import { ContentModule } from './content/content.module';
import { TicketService } from './ticket/ticket.service';
import { TicketController } from './ticket/ticket.controller';
import { TicketModule } from './ticket/ticket.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <-- this makes ConfigService available app-wide
    }),
    AuthModule,
    UsersModule,
    MailModule,
    PrismaModule,
    ProjectModule,
    CategoryModule,
    GoalsModule,
    IncomeModule,
    SavingsGoalModule,
    BudgetModule,
    ExpenseModule,
    AnalyticsModule,
    AdminModule,
    AdminUserModule,
    ContentModule,
    TicketModule,
  ],
  controllers: [AppController, IncomeController, BudgetController, AnalyticsController, AdminUserController, TicketController], // Only controllers here that don't belong to other modules
  providers: [AppService, IncomeService, BudgetService, AnalyticsService, AdminUserService, TicketService],      // Same with providers
})
export class AppModule {}

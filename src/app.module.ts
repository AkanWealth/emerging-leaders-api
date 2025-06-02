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
  ],
  controllers: [AppController, IncomeController, BudgetController], // Only controllers here that don't belong to other modules
  providers: [AppService, IncomeService, BudgetService],      // Same with providers
})
export class AppModule {}

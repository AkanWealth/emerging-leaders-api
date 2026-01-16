import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
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
import { ActivityLogModule } from './activity-log/activity-log.module';
import { RecurringIncomeController } from './recurring-income/recurring-income.controller';
import { RecurringIncomeService } from './recurring-income/recurring-income.service';
import { RecurringIncomeModule } from './recurring-income/recurring-income.module';
import { RecurringIncomeCronModule } from './recurring-income-cron/recurring-income-cron.module';
import { CurrencyService } from './currency/currency.service';
import { CurrencyController } from './currency/currency.controller';
import { CurrencyModule } from './currency/currency.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsModule } from './notifications/notifications.module';
import { AssessmentCategoryService } from './assessment-category/assessment-category.service';
import { AssessmentCategoryController } from './assessment-category/assessment-category.controller';
import { AssessmentCategoryModule } from './assessment-category/assessment-category.module';
import { AssessmentModule } from './assessment/assessment.module';
import { NotebookController } from './notebook/notebook.controller';
import { NotebookService } from './notebook/notebook.service';
import { NotebookModule } from './notebook/notebook.module';
import { SavingsModule } from './savings/savings.module';
import { Module1Module } from './module1/module1.module';
import { Module2Controller } from './module2/module2.controller';
import { Module2Service } from './module2/module2.service';
import { Module2Module } from './module2/module2.module';
import { Module3Module } from './module3/module3.module';
import { FinanceSetupModule } from './finance-setup/finance-setup.module';
import { AssessmentCronService } from './assessment-cron/assessment-cron.service';
import { AssessmentCronModule } from './assessment-cron/assessment-cron.module';
import { NotificationPrefrenceModule } from './notification-prefrence/notification-prefrence.module';
import { MindsetModule } from './mindset/mindset.module';
import { BudgetNotificationService } from './budget-notification/budget-notification.service';
import { BudgetNotificationController } from './budget-notification/budget-notification.controller';
import { BudgetNotificationModule } from './budget-notification/budget-notification.module';
import { GoalNotificationModule } from './goal-notification/goal-notification.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <-- this makes ConfigService available app-wide
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    MailModule,
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
    ActivityLogModule,
    RecurringIncomeModule,
    RecurringIncomeCronModule,
    CurrencyModule,
    NotificationsModule,
    AssessmentCategoryModule,
    AssessmentModule,
    NotebookModule,
    SavingsModule,
    Module1Module,
    Module2Module,
    Module3Module,
    FinanceSetupModule,
    AssessmentCronModule,
    NotificationPrefrenceModule,
    MindsetModule,
    BudgetNotificationModule,
    GoalNotificationModule,
  ],
  controllers: [AppController, IncomeController, BudgetController, AnalyticsController, AdminUserController, TicketController, RecurringIncomeController, CurrencyController, NotificationsController, AssessmentCategoryController, NotebookController, Module2Controller, BudgetNotificationController], // Only controllers here that don't belong to other modules
  providers: [AppService, IncomeService, BudgetService, AnalyticsService, AdminUserService, TicketService, RecurringIncomeService, CurrencyService, NotificationsService, AssessmentCategoryService, NotebookService, Module2Service, AssessmentCronService, BudgetNotificationService],      // Same with providers
})
export class AppModule {}

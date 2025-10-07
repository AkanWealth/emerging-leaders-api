// src/jobs/monthly-assessment.job.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { format } from 'date-fns';
import { QuestionType, AssessmentStatus } from '@prisma/client';

@Injectable()
export class MonthlyAssessmentJob {
  private readonly logger = new Logger(MonthlyAssessmentJob.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly CATEGORY_ID = '8685bda7-4cee-4557-8464-daa0a24483e3';

  private readonly QUESTIONS = [
    { question: 'What is your source of income?', type: QuestionType.SHORT_TEXT },
    { question: 'What is your current monthly income?', type: QuestionType.SHORT_TEXT },
    { question: 'Do you save regularly?', type: QuestionType.RADIO, options: ['Yes', 'No'] },
    { question: 'What is your frequency of saving?', type: QuestionType.RADIO, options: ['Irregular', 'Daily', 'Weekly', 'Monthly'] },
    { question: 'How much do you save based on the frequency stated previously?', type: QuestionType.SHORT_TEXT },
    { question: 'How much freedom of choice and control do you feel you have over the way your life turns out?', type: QuestionType.RADIO, options: ['A great deal', 'Mostly', 'A little', 'Not very much', 'None at all'] },
    { question: 'Overall, how satisfied are you with life as a whole these days?', type: QuestionType.RADIO, options: ['Completely satisfied', 'Mostly satisfied', 'Somewhat dissatisfied', 'Not at all satisfied'] },
    { question: 'How happy did you feel yesterday?', type: QuestionType.RADIO, options: ['Completely happy', 'Mostly happy', 'A little happy', 'Not very happy', 'None at all happy'] },
    { question: 'Do you feel your life has important purpose or meaning?', type: QuestionType.RADIO, options: ['Completely worthwhile', 'Mostly worthwhile', 'A little worthwhile', 'Not very worthwhile', 'Not at all worthwhile'] },
    { question: 'Do you lack a source of income?', type: QuestionType.RADIO, options: ['Yes', 'No'] },
    { question: 'Do you have a drug or alcohol addiction?', type: QuestionType.RADIO, options: ['Yes', 'No'] },
    { question: 'Are you an underage parent (parents below 18 years)?', type: QuestionType.RADIO, options: ['Yes', 'No'] },
    { question: 'Do you experience loneliness or isolation?', type: QuestionType.RADIO, options: ['Yes', 'No'] },
    { question: 'Let us know other challenges you have?', type: QuestionType.LONG_TEXT },
  ];

  // ✅ Run automatically on the 1st day of each month at midnight
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async createMonthlyAssessment() {
    const now = new Date();
    const month = format(now, 'MMMM'); // e.g. "October"
    const year = now.getFullYear();
    const title = `${month} ${year} Assessment`;

    this.logger.log(`Checking for existing assessment: ${title}`);

    // ✅ Prevent duplicate per month+year
    const exists = await this.prisma.assessment.findFirst({
      where: { scheduledMonth: month, scheduledYear: year },
    });

    if (exists) {
      this.logger.warn(`⚠️ ${title} already exists — skipping.`);
      return;
    }

    const scheduledFor = new Date(`${year}-${now.getMonth() + 1}-16T09:30:00Z`);

    const assessment = await this.prisma.assessment.create({
      data: {
        title,
        categoryId: this.CATEGORY_ID,
        status: AssessmentStatus.OPEN,
        scheduledFor,
        scheduledMonth: month,
        scheduledYear: year,
      },
    });

    // ✅ Create questions and options
    for (const [index, q] of this.QUESTIONS.entries()) {
      const question = await this.prisma.assessmentQuestion.create({
        data: {
          assessmentId: assessment.id,
          question: q.question,
          type: q.type,
          required: true,
          order: index + 1,
        },
      });

      if (q.options?.length) {
        await this.prisma.assessmentOption.createMany({
          data: q.options.map((opt) => ({
            questionId: question.id,
            value: opt,
          })),
        });
      }
    }

    this.logger.log(`✅ ${title} created successfully!`);
  }
}

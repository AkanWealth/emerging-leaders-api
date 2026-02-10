import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { addMonths, addDays } from 'date-fns';
import { QuestionType, AssessmentStatus } from '@prisma/client';

@Injectable()
export class AssessmentCronJob {
  private readonly logger = new Logger(AssessmentCronJob.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('App started → running assessment cron once for testing');
    await this.run();
  }

  private readonly INTERVALS = [1, 3, 6];

  private getNextIntervalIndex(current?: number | null): number {
    if (current === null || current === undefined) return 0;
    return Math.min(current + 1, 2);
  }

  private getMonths(intervalIndex: number): number {
    return this.INTERVALS[Math.min(intervalIndex, 2)];
  }

  // You will paste your QUESTIONS array here
  private readonly QUESTIONS: Array<{
    question: string;
    type: QuestionType;
    required: boolean;
    options?: string[];
  }> = [
  // CONSENT
  {
    question: 'Do you consent to sharing your information with us?',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },
  {
    question: 'Do you consent to us sharing the summary report with current and future partners?',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  // DEMOGRAPHICS SNAPSHOT
  {
    question: 'First Name',
    type: QuestionType.SHORT_TEXT,
    required: true,
  },
  {
    question: 'Last Name',
    type: QuestionType.SHORT_TEXT,
    required: true,
  },
  {
    question: 'Date of Birth',
    type: QuestionType.SHORT_TEXT,
    required: true,
  },
  {
    question: 'Phone Number',
    type: QuestionType.SHORT_TEXT,
    required: true,
  },
  {
    question: 'Email',
    type: QuestionType.SHORT_TEXT,
    required: true,
  },

  {
    question: 'Age',
    type: QuestionType.RADIO,
    required: true,
    options: [
      'Below 18 Years',
      '18-29 Years',
      '30-35 Years',
      '36-49 Years',
      '50+ Years',
    ],
  },

  {
    question: 'Marital Status',
    type: QuestionType.RADIO,
    required: true,
    options: ['Single', 'Married', 'Divorced', 'Separated', 'Widowed'],
  },

  {
    question: 'Gender',
    type: QuestionType.SHORT_TEXT,
    required: true,
  },

  {
    question: 'Do you have a form of disability?',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  {
    question: 'If yes, please specify disability',
    type: QuestionType.SHORT_TEXT,
    required: false,
  },

  {
    question: 'Your city/town',
    type: QuestionType.SHORT_TEXT,
    required: true,
  },

  // EDUCATION
  {
    question: 'What is the highest education you have completed (tick all that apply)?',
    type: QuestionType.CHECKBOX,
    required: true,
    options: ['Primary', 'Secondary', 'College / TVET', 'University'],
  },

  // TRAINING IMPACT
  {
    question: 'Since the training, what changes have you made in your life?',
    type: QuestionType.CHECKBOX,
    required: true,
    options: [
      'Upskilling - Signed up for training',
      'Reduced Alcohol/Substance intake',
      'Improved relationships',
      'Changed housing',
      'Improved savings',
      'Improved budgeting',
      'Increase in employment',
      'I am now more confident in making decisions',
      'None',
      'Other',
    ],
  },

  // INCOME
  {
    question: 'What is your main source of income?',
    type: QuestionType.SHORT_TEXT,
    required: true,
  },

  {
    question: 'Employment Status',
    type: QuestionType.RADIO,
    required: true,
    options: ['Unemployed', 'Part-time', 'Full-time'],
  },

  {
    question: 'How many hours do you work in paid employment per week?',
    type: QuestionType.SHORT_TEXT,
    required: true,
  },

  {
    question: 'What is your current monthly income?',
    type: QuestionType.RADIO,
    required: true,
    options: [
      '0 - 500',
      '501 - 1000',
      '1001 - 1500',
      '1501 - 2000',
      '2001 - 2500',
      '2501 and Above',
    ],
  },

  {
    question: 'On a scale of 1-5, how satisfied are you with the work you do to earn a living?',
    type: QuestionType.RADIO,
    required: true,
    options: [
      'Not satisfied at all (1)',
      'Slightly satisfied (2)',
      'Neutral (3)',
      'Satisfied (4)',
      'Completely satisfied (5)',
    ],
  },

  {
    question: 'Have you saved any money in the past 3 months, even a small amount?',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  {
    question: 'Frequency of Saving?',
    type: QuestionType.RADIO,
    required: true,
    options: ['Daily', 'Weekly', 'Monthly', 'Occasionally'],
  },

  {
    question: 'How much do you save on average per month?',
    type: QuestionType.RADIO,
    required: true,
    options: [
      '0 - 20',
      '21 - 50',
      '51 - 100',
      '101 - 150',
      '151 - 200',
      '201 and above',
    ],
  },

  {
    question: 'How much were you saving BEFORE the training?',
    type: QuestionType.RADIO,
    required: true,
    options: [
      '0 - 20',
      '21 - 50',
      '51 - 100',
      '101 - 150',
      '151 - 200',
      '201 and above',
    ],
  },

  {
    question: 'Did you budget your money before the training?',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  {
    question: 'Do you now budget your money?',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  {
    question: 'Was this as a result of the course?',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  // WELLNESS
  {
    question: 'How much freedom of choice and control do you feel you have over the way your life turns out?',
    type: QuestionType.RADIO,
    required: true,
    options: [
      'A great deal',
      'Mostly',
      'A little',
      'Not Very Much',
      'None at all',
    ],
  },

  {
    question: 'Overall, how satisfied are you with life as a whole these days?',
    type: QuestionType.RADIO,
    required: true,
    options: [
      'Completely satisfied',
      'Mostly Satisfied',
      'Neither satisfied/dissatisfied',
      'Somewhat Dissatisfied',
      'Not at All Satisfied',
    ],
  },

  {
    question: 'How happy did you feel yesterday?',
    type: QuestionType.RADIO,
    required: true,
    options: [
      'Completely happy',
      'Mostly happy',
      'A little happy',
      'Not very happy',
      'Not at all happy',
    ],
  },

  {
    question: 'Do you feel your life has an important purpose or meaning?',
    type: QuestionType.RADIO,
    required: true,
    options: [
      'Completely Worthwhile',
      'Mostly Worthwhile',
      'A little worthwhile',
      'Not Very Worthwhile',
      'Not at all Worthwhile',
    ],
  },

  // SELF BELIEF
  {
    question: 'I believe I can make positive changes in my life',
    type: QuestionType.RADIO,
    required: true,
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
  },

  {
    question: 'When things are hard, I can find a way to keep going',
    type: QuestionType.RADIO,
    required: true,
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
  },

  {
    question: 'I feel confident I can reach the goals I set for myself',
    type: QuestionType.RADIO,
    required: true,
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
  },

  // MINDSET POSITIVE
  {
    question: 'Which leadership mindset have you adopted since the training?',
    type: QuestionType.CHECKBOX,
    required: true,
    options: [
      'Focus',
      'See yourself as a leader',
      'Change something',
      'See and take responsibility',
      'Lift up your head',
      'Appreciative thinking',
      'Be proactive',
      'None',
    ],
  },

  // MINDSET NEGATIVE
  {
    question: 'Which negative mindset have you overcome since the training?',
    type: QuestionType.CHECKBOX,
    required: true,
    options: [
      'Lazy Thinking',
      'Stuck Thinking',
      'Unfinished Thinking',
      'Recycled Thinking',
      'Fixed Thinking',
      'Self Thinking',
      'Hopeless thinking',
      'None',
    ],
  },

  // CHALLENGES
  {
    question: 'Lack of income',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  {
    question: 'Drugs and Alcohol Addiction',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  {
    question: 'Underage parenting (parent below 18 yrs.)',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  {
    question: 'Loneliness / Isolation',
    type: QuestionType.RADIO,
    required: true,
    options: ['Yes', 'No'],
  },

  {
    question: 'Any other challenge?',
    type: QuestionType.LONG_TEXT,
    required: false,
  },
];

  @Cron('0 1 * * *', { timeZone: 'Africa/Lagos' })
  async run() {
    this.logger.log('Assessment cron started');

    const now = new Date();

    // Find users who are due NOW or in the past
    const dueUserIds = await this.prisma.userAssessment
      .findMany({
        where: {
          nextScheduledFor: { lte: now },
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      })
      .then((rows) => rows.map((r) => r.userId));

    if (dueUserIds.length === 0) {
      this.logger.log('No users are due for assessment at this time');
      this.logger.log('Assessment cron completed');
      return;
    }

    this.logger.log(`Found ${dueUserIds.length} users due for assessment`);

    // Decide which assessment version to use (create new if needed)
    const assessment = await this.getOrCreateAssessmentForCurrentWave(now);

    // Process each due user
    for (const userId of dueUserIds) {
      try {
        const lastAssignment = await this.prisma.userAssessment.findFirst({
          where: { userId },
          orderBy: { submittedAt: 'desc' },
        });

        let nextIntervalIndex: number;

        if (!lastAssignment) {
          nextIntervalIndex = 0;
        } else {
          nextIntervalIndex = this.getNextIntervalIndex(lastAssignment.intervalIndex);
        }

        const monthsToNext = this.getMonths(nextIntervalIndex);
        const nextScheduledFor = addMonths(now, monthsToNext);

        await this.prisma.userAssessment.create({
          data: {
            userId,
            assessmentId: assessment.id,
            intervalIndex: nextIntervalIndex,
            nextScheduledFor,
            answers: {},
          },
        });

        this.logger.log(
          `Assigned "${assessment.title}" to user ${userId} → next in ${monthsToNext} months (interval ${nextIntervalIndex})`,
        );
      } catch (err) {
        this.logger.error(`Error assigning assessment to user ${userId}`, err);
      }
    }

    this.logger.log('Assessment cron completed');
  }

  /**
   * Returns an existing recent OPEN assessment or creates a new numbered one
   */
  private async getOrCreateAssessmentForCurrentWave(now: Date) {
    // Look for a recent OPEN assessment (created in last 10 days)
    let assessment = await this.prisma.assessment.findFirst({
      where: {
        status: AssessmentStatus.OPEN,
        createdAt: {
          gte: addDays(now, -10),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (assessment) {
      this.logger.log(`Re-using existing assessment: ${assessment.title}`);
      return assessment;
    }

    // No recent open assessment → create new one
    const count = await this.prisma.assessment.count();
    const title = `${String(count + 1).padStart(3, '0')} Assessment`;

    this.logger.log(`Creating new assessment version: ${title}`);

    assessment = await this.prisma.assessment.create({
      data: {
        title,
        categoryId: '8685bda7-4cee-4557-8464-daa0a24483e3',
        status: AssessmentStatus.OPEN,
        scheduledFor: now,
      },
    });

    // Create questions (same every time)
    await this.createQuestions(assessment.id);

    return assessment;
  }

  /**
   * Creates the same set of questions and options for the given assessment
   */
  private async createQuestions(assessmentId: string) {
    for (const [index, q] of this.QUESTIONS.entries()) {
      const question = await this.prisma.assessmentQuestion.create({
        data: {
          assessmentId,
          question: q.question,
          type: q.type,
          required: q.required,
          order: index + 1,
        },
      });

      if (q.options && q.options.length > 0) {
        await this.prisma.assessmentOption.createMany({
          data: q.options.map((value) => ({
            questionId: question.id,
            value,
          })),
        });
      }
    }
  }
}
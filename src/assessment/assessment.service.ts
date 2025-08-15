import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitAssessmentResponseDto } from './dto/submit-response.dto';

@Injectable()
export class AssessmentService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

 async createAssessment(dto: CreateAssessmentDto) {
  try {
    const assessment = await this.prisma.assessment.create({
      data: {
        ...dto,
        scheduledFor: new Date(dto.scheduledFor),
      },
    });

    // Send broadcast notification to all users
    await this.notificationsService.broadcastNotification(
      'New Assessment Scheduled',
      `An assessment has been scheduled for ${new Date(dto.scheduledFor).toLocaleString()}`,
      { assessmentId: assessment.id, scheduledFor: assessment.scheduledFor.toISOString() },
      'ASSESSMENT'
    );

    return assessment;
  } catch (error) {
    if (error.code === 'P2003' && error.meta?.constraint === 'Assessment_categoryId_fkey') {
      throw new BadRequestException(
        'The selected category does not exist. Please choose a valid category.'
      );
    }
    throw error; // rethrow for other unexpected errors
  }
}

  async updateAssessment(id: string, dto: UpdateAssessmentDto) {
    return this.prisma.assessment.update({
      where: { id },
      data: {
        ...dto,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
      },
    });
  }

  async deleteAssessment(id: string) {
    return this.prisma.assessment.delete({ where: { id } });
  }

  async addQuestion(dto: CreateQuestionDto) {
    const question = await this.prisma.assessmentQuestion.create({
      data: {
        assessmentId: dto.assessmentId,
        question: dto.question,
        type: dto.type,
        required: dto.required,
      },
    });

    if (dto.options?.length) {
      await this.prisma.assessmentOption.createMany({
        data: dto.options.map((val) => ({
          value: val,
          questionId: question.id,
        })),
      });
    }

    return this.prisma.assessmentQuestion.findUnique({
      where: { id: question.id },
      include: { options: true },
    });
  }

  async submitResponse(userId: string, dto: SubmitAssessmentResponseDto) {
    const existing = await this.prisma.userAssessment.findFirst({
      where: { userId, assessmentId: dto.assessmentId },
    });
    if (existing) {
      throw new Error('You have already submitted this assessment');
    }

    return this.prisma.userAssessment.create({
      data: {
        userId,
        assessmentId: dto.assessmentId,
        answers: dto.answers,
      },
    });
  }

  async getUserAssessments(userId: string) {
    const now = new Date();
    const assessments = await this.prisma.assessment.findMany({
      where: {
        status: 'OPEN',
        scheduledFor: { lte: now },
      },
      include: {
        category: true,
        questions: { include: { options: true } },
        userResponses: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    return assessments.map((a) => ({
      ...a,
      submitted: a.userResponses.length > 0,
    }));
  }

  async getAssessmentsWithStats(userId: string) {
    const assessments = await this.prisma.assessment.findMany({
      include: {
        category: true,
        questions: { include: { options: true } },
        userResponses: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    return assessments.map((assessment) => {
      const submitted = assessment.userResponses.length > 0;
      return {
        ...assessment,
        submitted,
        userResponses: undefined,
      };
    });
  }

  async lockAssessment(id: string) {
    return this.prisma.assessment.update({
      where: { id },
      data: { status: 'LOCKED' },
    });
  }

  async unlockAssessment(id: string) {
    return this.prisma.assessment.update({
      where: { id },
      data: { status: 'OPEN' },
    });
  }
}

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

async createAssessment(dto: CreateAssessmentDto, senderId: string) {
  try {
    const assessment = await this.prisma.assessment.create({
      data: {
        ...dto,
        scheduledFor: new Date(dto.scheduledFor),
      },
    });

    // ✅ Include senderId in broadcast
    await this.notificationsService.broadcastNotification(
      senderId,
      '📘 New Assessment Scheduled',
      `An assessment has been scheduled for ${new Date(dto.scheduledFor).toLocaleString()}`,
      {
        assessmentId: assessment.id,
        scheduledFor: assessment.scheduledFor.toISOString(),
      },
      'ASSESSMENT',
    );

    return assessment;
  } catch (error) {
    if (error.code === 'P2003' && error.meta?.constraint === 'Assessment_categoryId_fkey') {
      throw new BadRequestException(
        'The selected category does not exist. Please choose a valid category.'
      );
    }
    throw error;
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

  async addQuestionsBulk(questionsDto: CreateQuestionDto[]) {
  // 1. Create all questions first
  const createdQuestions = await this.prisma.$transaction(
    questionsDto.map((dto) =>
      this.prisma.assessmentQuestion.create({
        data: {
          assessmentId: dto.assessmentId,
          question: dto.question,
          type: dto.type,
          required: dto.required ?? false,
          order: dto.order ?? null,
        },
      })
    )
  );

  // 2. Collect all options and attach them to their questions
  const optionsData = questionsDto.flatMap((dto, index) =>
    dto.options?.map((val) => ({
      value: val,
      questionId: createdQuestions[index].id,
    })) ?? []
  );

  if (optionsData.length) {
    await this.prisma.assessmentOption.createMany({
      data: optionsData,
    });
  }

  // 3. Return questions with options included
  return this.prisma.assessmentQuestion.findMany({
    where: {
      id: { in: createdQuestions.map((q) => q.id) },
    },
    include: { options: true },
    orderBy: { order: 'asc' }, // optional: keep questions ordered
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

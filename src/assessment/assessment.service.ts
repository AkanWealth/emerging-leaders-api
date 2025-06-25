import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAssessmentDto
} from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { AssessmentStatus } from '@prisma/client';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitAssessmentResponseDto } from './dto/submit-response.dto';

@Injectable()
export class AssessmentService {
  constructor(private prisma: PrismaService) {}

  async createAssessment(dto: CreateAssessmentDto) {
    return this.prisma.assessment.create({
      data: {
        ...dto,
        scheduledFor: new Date(dto.scheduledFor),
      },
    });
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
    return this.prisma.userAssessment.create({
      data: {
        userId,
        assessmentId: dto.assessmentId,
        answers: dto.answers,
      },
    });
  }

  async getAssessmentsWithStats() {
    return this.prisma.assessment.findMany({
      include: {
        category: true,
        questions: true,
        userResponses: true,
      },
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

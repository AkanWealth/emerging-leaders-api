import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        title: dto.title,
        repeat: dto.repeat,
        date: new Date(dto.date),
        time: dto.time,
        projectId: dto.projectId,
      },
    });
  }

  findAll() {
    return this.prisma.goal.findMany({
      include: {
        project: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.goal.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
  }

  update(id: string, dto: CreateGoalDto) {
    return this.prisma.goal.update({
      where: { id },
      data: {
        title: dto.title,
        repeat: dto.repeat,
        date: new Date(dto.date),
        time: dto.time,
        projectId: dto.projectId,
      },
    });
  }

  remove(id: string) {
    return this.prisma.goal.delete({
      where: { id },
    });
  }
}

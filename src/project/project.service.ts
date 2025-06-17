import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService, private readonly activityLogService: ActivityLogService,) {}

 async create(userId: string, dto: CreateProjectDto) {
  const project = await this.prisma.project.create({
    data: {
      name: dto.name,
      description: dto.description,
      projectColor: dto.projectColor,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      categoryId: dto.categoryId,
      userId: userId, 
    },
  });

  await this.activityLogService.log(userId, `Created project: ${dto.name}`);
  return project;
}



  findAll() {
    return this.prisma.project.findMany({
      include: {
        category: true,
        goals: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        category: true,
        goals: true,
      },
    });
  }

  update(id: string, dto: CreateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        projectColor: dto.projectColor,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        categoryId: dto.categoryId,
      },
    });
  }

  remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService, private readonly activityLogService: ActivityLogService,) {}

 async create(userId: string, dto: CreateProjectDto) {
  // 1. Check if user exists
  const userExists = await this.prisma.user.findUnique({
    where: { id: userId },
  });
  if (!userExists) {
    throw new NotFoundException(`User with id ${userId} not found`);
  }

  // 2. Check if category exists
  const categoryExists = await this.prisma.category.findUnique({
    where: { id: dto.categoryId },
  });
  if (!categoryExists) {
    throw new NotFoundException(`Category with id ${dto.categoryId} not found`);
  }

  // Optional: Validate dates to be valid and endDate after startDate
  const startDate = new Date(dto.startDate);
  const endDate = new Date(dto.endDate);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new BadRequestException('Invalid startDate or endDate');
  }
  if (startDate > endDate) {
    throw new BadRequestException('startDate must be before endDate');
  }

  // 3. Proceed to create the project
  const project = await this.prisma.project.create({
    data: {
      name: dto.name,
      description: dto.description,
      projectColor: dto.projectColor,
      startDate,
      endDate,
      categoryId: dto.categoryId,
      userId,
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

 async remove(id: string, force = false) {
  const project = await this.prisma.project.findUnique({
    where: { id },
    include: { goals: true },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  if (!force && project.goals.length > 0) {
    throw new BadRequestException(
      'This project has associated goals. Please delete the goals first or confirm force deletion.'
    );
  }

  // Optional: Delete goals first if force is true
  if (force && project.goals.length > 0) {
    await this.prisma.goal.deleteMany({
      where: { projectId: id },
    });
  }

  return this.prisma.project.delete({
    where: { id },
  });
}

}

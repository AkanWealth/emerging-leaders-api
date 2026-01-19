import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateCategoryDto) {
  return this.prisma.category.create({
    data: {
      icon: dto.icon,
      title: dto.title,
      description: dto.description,
      usageContext: dto.usageContext,
      userId, // attach the user here
    },
  });
}


  findAll() {
    return this.prisma.category.findMany();
  }

findAllUserCate(userId: string) {
  return this.prisma.category.findMany({
    where: {
      OR: [
        { userId },                 // user-created
        { defaultCate: true },      // system defaults
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}


  findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  update(id: string, dto: CreateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: {
        icon: dto.icon,
        title: dto.title,
        description: dto.description,
      },
    });
  }

  remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}

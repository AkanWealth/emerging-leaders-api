import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

//   create(userId: string, dto: CreateCategoryDto) {
//   return this.prisma.category.create({
//     data: {
//       icon: dto.icon,
//       title: dto.title,
//       description: dto.description,
//       usageContext: dto.usageContext,
//       userId, 
//     },
//   });
// }

async create(userId: string, dto: CreateCategoryDto) {
  const existingDefault = await this.prisma.category.findFirst({
    where: {
      title: dto.title,
      defaultCate: true,
      // optional but recommended if categories differ by context
      usageContext: dto.usageContext ?? undefined,
    },
  });

  if (existingDefault) {
    throw new BadRequestException(
      'This category already exists as a default category'
    );
  }

  return this.prisma.category.create({
    data: {
      icon: dto.icon,
      title: dto.title,
      description: dto.description,
      usageContext: dto.usageContext,
      userId,
      defaultCate: false, 
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
        { userId },                 
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

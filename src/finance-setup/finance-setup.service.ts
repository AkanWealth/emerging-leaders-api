import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinanceSetupDto } from './dto/create-finance-setup.dto';
import { UpdateFinanceSetupDto } from './dto/update-finance-setup.dto';

@Injectable()
export class FinanceSetupService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFinanceSetupDto) {
  // 1. Check if the user has already completed the finance setup
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { financeCompleted: true },
  });

  if (user?.financeCompleted) {
    throw new BadRequestException('You have already completed your finance setup.');
  }

  // 2. Create the finance setup
  const financeSetup = await this.prisma.financeSetup.create({
    data: {
      ...dto,
      userId,
    },
    include: { currency: true },
  });

  // 3. Update the user to set financeCompleted to true
  await this.prisma.user.update({
    where: { id: userId },
    data: { financeCompleted: true },
  });

  return financeSetup;
}


  findAll(userId: string) {
    return this.prisma.financeSetup.findMany({
      where: { userId },
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const record = await this.prisma.financeSetup.findFirst({
      where: { id, userId },
      include: { currency: true },
    });
    if (!record) throw new NotFoundException('Finance setup not found');
    return record;
  }

  async update(userId: string, id: string, dto: UpdateFinanceSetupDto) {
    await this.findOne(userId, id); // ensure it belongs to user
    return this.prisma.financeSetup.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.financeSetup.delete({ where: { id } });
  }
}

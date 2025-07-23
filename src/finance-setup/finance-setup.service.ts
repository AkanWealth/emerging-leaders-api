import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinanceSetupDto } from './dto/create-finance-setup.dto';
import { UpdateFinanceSetupDto } from './dto/update-finance-setup.dto';

@Injectable()
export class FinanceSetupService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateFinanceSetupDto) {
    return this.prisma.financeSetup.create({
      data: { ...dto, userId, financeCompleted: true},
      include: { currency: true },
    });
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

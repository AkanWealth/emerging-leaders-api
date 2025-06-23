import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCurrencyDto) {
    return this.prisma.currency.create({ data: dto });
  }

  findAll() {
    return this.prisma.currency.findMany();
  }

  findOne(id: string) {
    return this.prisma.currency.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateCurrencyDto) {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('Currency not found');
    return this.prisma.currency.update({ where: { id }, data: dto });
  }
}

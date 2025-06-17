import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
 import { TicketStatus } from '@prisma/client'; // ensure this is imported

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTicketDto, userId: string) {
    return this.prisma.ticket.create({
      data: { ...dto, userId },
    });
  }

  findUserTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
    });
  }



async updateStatus(id: string, dto: UpdateTicketStatusDto) {
  const ticket = await this.findOne(id);
  if (!ticket) {
    throw new NotFoundException('Ticket not found');
  }

  return this.prisma.ticket.update({
    where: { id },
    data: {
      status: {
        set: dto.status as TicketStatus,
      },
    },
  });
}


  async delete(id: string) {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  async countStatus() {
    return {
      total: await this.prisma.ticket.count(),
      pending: await this.prisma.ticket.count({ where: { status: TicketStatus.PENDING } }),
      inprogress: await this.prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      resolved: await this.prisma.ticket.count({ where: { status: TicketStatus.RESOLVED } }),
    };
  }
}

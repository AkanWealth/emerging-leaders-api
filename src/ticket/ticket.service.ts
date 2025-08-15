import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketStatus } from '@prisma/client';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Create new ticket
async create(dto: CreateTicketDto, userId: string) {
  const ticketNumber = `TCK-${Date.now()}`; // or use UUID, shortid, etc.

  const ticket = await this.prisma.ticket.create({
    data: { ...dto, userId, ticketNumber },
  });

  await this.activityLogService.log(userId, `Opened support ticket: ${dto.subject}`);

  // Notify all admins
  const admins = await this.prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true },
  });

  for (const admin of admins) {
    await this.notificationsService.sendToUser(
      admin.id,
      'New Support Ticket',
      `A new ticket "${dto.subject}" has been created.`,
      { ticketId: ticket.id },
      'TICKET'
    );
  }

  return ticket;
}


  // Get tickets for a specific user
  findUserTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get all tickets
  findAll() {
    return this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get single ticket
  findOne(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
    });
  }

  // Update ticket status
  async updateStatus(id: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.findOne(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: {
          set: dto.status as TicketStatus,
        },
      },
    });

    // Notify ticket creator about the status change
    await this.notificationsService.sendToUser(
      ticket.userId,
      'Ticket Status Update',
      `Your ticket "${ticket.subject}" is now marked as ${dto.status.replace('_', ' ').toLowerCase()}.`,
      { ticketId: ticket.id, newStatus: dto.status },
      'TICKET'
    );

    return updated;
  }

  // Delete ticket
  async delete(id: string) {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  // Count tickets by status
  async countStatus() {
    return {
      total: await this.prisma.ticket.count(),
      pending: await this.prisma.ticket.count({ where: { status: TicketStatus.PENDING } }),
      inprogress: await this.prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      resolved: await this.prisma.ticket.count({ where: { status: TicketStatus.RESOLVED } }),
    };
  }
}

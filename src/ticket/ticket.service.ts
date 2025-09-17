import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketStatus } from '@prisma/client';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  // Create new ticket
async create(dto: CreateTicketDto, userId: string) {
  const ticketNumber = `TCK-${Date.now()}`;

  const ticket = await this.prisma.ticket.create({
    data: { ...dto, userId, ticketNumber },
    include: { user: true }, // so we have user info for email
  });

  await this.activityLogService.log(userId, `Opened support ticket: ${dto.subject}`);

  // Notify all admins
  const admins = await this.prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true, email: true, name: true },
  });

  for (const admin of admins) {
    // In-app notification
    await this.notificationsService.sendToUser(
      admin.id,
      'New Support Ticket',
      `A new ticket "${dto.subject}" has been created by ${ticket.user.name ?? 'a user'}.`,
      { ticketId: ticket.id },
      'TICKET'
    );

    // Email notification
    await this.mailService.sendEmailWithTemplate(
      admin.email,
      41132332, // Postmark template ID
      {
        title: 'New Support Ticket',
        fullName: admin.name ?? 'Admin',
        body: `A new ticket "<strong>${dto.subject}</strong>" has been created by ${ticket.user.name ?? 'a user'}.`,
        alertMessage: `Ticket Number: ${ticketNumber}`,
      }
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
  async findAll(params: {
  page?: number;
  limit?: number;
  ticketNumber?: string;
  status?: string;
  userId?: string;
}) {
  const { page = 1, limit = 10, ticketNumber, status, userId } = params;

  const where: any = {};
  if (ticketNumber) where.ticketNumber = ticketNumber;
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const [tickets, total] = await this.prisma.$transaction([
    this.prisma.ticket.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.ticket.count({ where }),
  ]);

  return {
    data: tickets,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


  // Get single ticket
  findOne(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
    });
  }

  // Update ticket status
 async updateStatus(id: string, dto: UpdateTicketStatusDto) {
  const ticket = await this.prisma.ticket.findUnique({
    where: { id },
    include: { user: true }, // get user's email & name
  });

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

  const formattedStatus = dto.status.replace('_', ' ').toLowerCase();

  // In-app notification
  await this.notificationsService.sendToUser(
    ticket.userId,
    'Ticket Status Update',
    `Your ticket "${ticket.subject}" is now marked as ${formattedStatus}.`,
    { ticketId: ticket.id, newStatus: dto.status },
    'TICKET'
  );

  // Email notification using Postmark template
 await this.mailService.sendTicketStatusUpdateEmail(
  ticket.user.email,
  ticket.user.name ?? 'Valued User',
  ticket.subject,
  formattedStatus
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

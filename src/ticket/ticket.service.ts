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
  search?: string;
  status?: string;
}) {
  const { page = 1, limit = 10, search, status } = params;

  const where: any = {};

  // Status filter
  if (status) where.status = status;

  // Search filter (matches ticketNumber, user first/last name, or subject)
  if (search) {
    where.OR = [
      { ticketNumber: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { user: { OR: [
          { firstname: { contains: search, mode: 'insensitive' } },
          { lastname: { contains: search, mode: 'insensitive' } },
        ] } 
      },
    ];
  }

  const [tickets, total] = await this.prisma.$transaction([
    this.prisma.ticket.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: true }, // Include user info for name search/display
    }),
    this.prisma.ticket.count({ where }),
  ]);

  return {
    data: tickets.map(t => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      status: t.status,
      userId: t.userId,
      userName: `${t.user.firstname ?? ''} ${t.user.lastname ?? ''}`.trim(),
      createdAt: t.createdAt,
    })),
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

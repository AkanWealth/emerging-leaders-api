import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketStatus } from '@prisma/client';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class TicketService {
    private readonly logger = new Logger(TicketService.name);
  constructor(
    private prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  // Create new ticket

// async create(dto: CreateTicketDto, userId: string) {
//   const ticketNumber = `TCK-${Date.now()}`;

//   const ticket = await this.prisma.ticket.create({
//     data: { ...dto, userId, ticketNumber },
//     include: { user: {
//           select: { 
//             id: true,
//             firstname: true,
//             lastname: true,
//             email: true,
//             phone: true,
//             profilePicture: true,
//             status: true,
//             isAdmin: true,
//             createdAt: true,
//             updatedAt: true, 
//             },
//         } }, // so we have user info for email
//   });

//   await this.activityLogService.log(userId, `Opened support ticket: ${dto.subject}`);

//   // Notify all admins
//   const admins = await this.prisma.user.findMany({
//     where: { isAdmin: true },
//     select: { id: true, email: true, name: true },
//   });

//   for (const admin of admins) {
//     // In-app notification (must succeed)
//     await this.notificationsService.sendToUser(
//       admin.id,
//       'New Support Ticket',
//       `A new ticket "${dto.subject}" has been created by ${ticket.user.firstname ?? 'a user'}.`,
//       { ticketId: ticket.id },
//       'TICKET'
//     );

//     // Email notification (best effort — failure won’t break ticket creation)
//     try {
//       await this.mailService.sendEmailWithTemplate(
//         admin.email,
//         41132332, // Postmark template ID
//         {
//           title: 'New Support Ticket',
//           fullName: admin.name ?? 'Admin',
//           body: `A new ticket "<strong>${dto.subject}</strong>" has been created by ${ticket.user.firstname ?? 'a user'}.`,
//           alertMessage: `Ticket Number: ${ticketNumber}`,
//         }
//       );
//     } catch (error) {
//       // Log the error but don’t throw it, so other admins still get the email
//       this.logger.error(
//         `Failed to send ticket email to admin ${admin.email}: ${error.message}`,
//       );
//     }
//   }

//   return {
//     message: 'Ticket created successfully',
//     ticket,
//   };
// }

 async create(dto: CreateTicketDto, userId: string) {
    const ticketNumber = `TCK-${Date.now()}`;

    // ✅ Create the ticket and include user info for notifications/emails
    const ticket = await this.prisma.ticket.create({
      data: { ...dto, userId, ticketNumber },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            phone: true,
            profilePicture: true,
            status: true,
            isAdmin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // ✅ Log user activity
    await this.activityLogService.log(userId, `Opened support ticket: ${dto.subject}`);

    // ✅ Notify all admins (in-app + email)
    const admins = await this.prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true, email: true, firstname: true, lastname: true },
    });

    for (const admin of admins) {
      const adminName = `${admin.firstname ?? ''} ${admin.lastname ?? ''}`.trim() || 'Admin';
      const userName = `${ticket.user.firstname ?? ''} ${ticket.user.lastname ?? ''}`.trim() || 'a user';

      // 🔔 In-app notification
      await this.notificationsService.sendToUser(
        userId, // sender = ticket creator
        admin.id, // receiver = admin
        '🎟️ New Support Ticket',
        `A new ticket "${dto.subject}" has been created by ${userName}.`,
        { ticketId: ticket.id },
        'TICKET',
      );

      // 📧 Email notification (non-blocking)
      try {
        await this.mailService.sendEmailWithTemplate(
          admin.email,
          41132332, // Postmark Template ID
          {
            title: 'New Support Ticket',
            fullName: adminName,
            body: `A new ticket "<strong>${dto.subject}</strong>" has been created by ${userName}.`,
            alertMessage: `Ticket Number: ${ticketNumber}`,
          },
        );
      } catch (error) {
        this.logger.error(
          `❌ Failed to send ticket email to admin ${admin.email}: ${error.message}`,
        );
      }
    }

    return {
      message: '✅ Ticket created successfully',
      ticket,
    };
  }
  
  // Get tickets for a specific user
  findUserTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get all tickets
//  async findAll(params: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   status?: string;
// }) {
//   const { page = 1, limit = 10, search, status } = params;

//   const where: any = {};

//   // Status filter
//   if (status) where.status = status;

//   // Search filter (matches ticketNumber, user first/last name, or subject)
//   if (search) {
//     where.OR = [
//       { ticketNumber: { contains: search, mode: 'insensitive' } },
//       { subject: { contains: search, mode: 'insensitive' } },
//       { user: { OR: [
//           { firstname: { contains: search, mode: 'insensitive' } },
//           { lastname: { contains: search, mode: 'insensitive' } },
//         ] } 
//       },
//     ];
//   }

//   const [tickets, total] = await this.prisma.$transaction([
//     this.prisma.ticket.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//       include: { user: true }, // Include user info for name search/display
//     }),
//     this.prisma.ticket.count({ where }),
//   ]);

//   return {
//     data: tickets.map(t => ({
//       id: t.id,
//       ticketNumber: t.ticketNumber,
//       subject: t.subject,
//       status: t.status,
//       userId: t.userId,
//       userName: `${t.user.firstname ?? ''} ${t.user.lastname ?? ''}`.trim(),
//       createdAt: t.createdAt,
//     })),
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// }

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
      {
        user: {
          OR: [
            { firstname: { contains: search, mode: 'insensitive' } },
            { lastname: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const [tickets, total, resolved, inProgress, pending] =
    await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: {
          select: { 
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            phone: true,
            profilePicture: true,
            status: true,
            isAdmin: true,
            createdAt: true,
            updatedAt: true, 
            },
        }},
      }),
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { status: 'PENDING' } }),
    ]);

  return {
    data: tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      status: t.status,
      userId: t.userId,
      description: t.description,
      userName: `${t.user.firstname ?? ''} ${t.user.lastname ?? ''}`.trim(),
      createdAt: t.createdAt,
    })),
    stats: {
      resolved,
      inProgress,
      pending,
    },
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
async updateStatus(
  id: string,
  dto: UpdateTicketStatusDto,
  senderId: string // required now
) {
  const ticket = await this.prisma.ticket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
          profilePicture: true,
          status: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundException('Ticket not found');
  }

  const updated = await this.prisma.ticket.update({
    where: { id },
    data: { status: dto.status as TicketStatus },
  });

  const formattedStatus = dto.status.replace(/_/g, ' ').toLowerCase();

  // ✅ Send in-app notification from the admin
  await this.notificationsService.sendToUser(
    senderId, // sender is admin
    ticket.userId, // receiver is ticket owner
    '🎫 Ticket Status Update',
    `Your ticket "${ticket.subject}" is now marked as ${formattedStatus}.`,
    { ticketId: ticket.id, newStatus: dto.status },
    'TICKET'
  );

  // ✅ Send email notification
  await this.mailService.sendTicketStatusUpdateEmail(
    ticket.user.email,
    ticket.user.firstname ?? 'Valued User',
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

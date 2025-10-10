// admin/admin-user.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { CreateUserByAdminDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { EditAdminDto } from './dto/edit-admin.dto';
import { UserStatus } from '@prisma/client'; 
import {
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  format,
} from 'date-fns';

@Injectable()
export class AdminUserService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}


// async getAllUsers(params: {
//   page?: number;
//   limit?: number;
//   search?: string;
// }) {
//   const { page = 1, limit = 10, search } = params;

//   const where: any = {
//     isAdmin: false, // only regular users
//   };

//   if (search) {
//     where.OR = [
//       { email: { contains: search, mode: 'insensitive' } },
//       { firstname: { contains: search, mode: 'insensitive' } },
//       { lastname: { contains: search, mode: 'insensitive' } },
//       { name: { contains: search, mode: 'insensitive' } },
//     ];

//     // if search is a valid date, check by createdAt or lastLogin
//     const maybeDate = new Date(search);
//     if (!isNaN(maybeDate.getTime())) {
//       where.OR.push(
//         { createdAt: { gte: maybeDate } },
//         { lastLogin: { gte: maybeDate } },
//       );
//     }
//   }

//   const [users, total] = await this.prisma.$transaction([
//     this.prisma.user.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         firstname: true,
//         lastname: true,
//         email: true,
//         name: true,
//         createdAt: true,
//         lastLogin: true,
//         status: true,
//       },
//     }),
//     this.prisma.user.count({ where }),
//   ]);

//   return {
//     data: users,
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// }

// async getAllAdmins(params: {
//   page?: number;
//   limit?: number;
//   search?: string;
// }) {
//   const { page = 1, limit = 10, search } = params;

//   const where: any = {
//     isAdmin: true, // only admins
//   };

//   if (search) {
//     where.OR = [
//       { email: { contains: search, mode: 'insensitive' } },
//       { firstname: { contains: search, mode: 'insensitive' } },
//       { lastname: { contains: search, mode: 'insensitive' } },
//       { name: { contains: search, mode: 'insensitive' } },
//     ];

//     const maybeDate = new Date(search);
//     if (!isNaN(maybeDate.getTime())) {
//       where.OR.push(
//         { createdAt: { gte: maybeDate } },
//         { lastLogin: { gte: maybeDate } },
//       );
//     }
//   }

//   const [admins, total] = await this.prisma.$transaction([
//     this.prisma.user.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         firstname: true,
//         lastname: true,
//         email: true,
//         name: true,
//         createdAt: true,
//         lastLogin: true,
//         status: true,
//       },
//     }),
//     this.prisma.user.count({ where }),
//   ]);

//   return {
//     data: admins,
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// }

async getAllUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const { page = 1, limit = 10, search, status } = params;

  const where: any = {
    isAdmin: false, // only regular users
  };

  // --- Optional search ---
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstname: { contains: search, mode: 'insensitive' } },
      { lastname: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];

    // if search is a valid date, check createdAt or lastLogin
    const maybeDate = new Date(search);
    if (!isNaN(maybeDate.getTime())) {
      where.OR.push(
        { createdAt: { gte: maybeDate } },
        { lastLogin: { gte: maybeDate } },
      );
    }
  }

  // --- Optional status filter ---
  if (status) {
    where.status = status.toUpperCase(); // e.g., "ACTIVE", "INACTIVE", etc.
  }

  // --- Query with pagination ---
  const [users, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        name: true,
        createdAt: true,
        lastLogin: true,
        status: true,
      },
    }),
    this.prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async getAllAdmins(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const { page = 1, limit = 10, search, status } = params;

  const where: any = {
    isAdmin: true, // only admins
  };

  // --- Optional search ---
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstname: { contains: search, mode: 'insensitive' } },
      { lastname: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];

    const maybeDate = new Date(search);
    if (!isNaN(maybeDate.getTime())) {
      where.OR.push(
        { createdAt: { gte: maybeDate } },
        { lastLogin: { gte: maybeDate } },
      );
    }
  }

  // --- Optional status filter ---
  if (status) {
    where.status = status.toUpperCase(); // Prisma expects enum match (e.g., "ACTIVE")
  }

  // --- Query with pagination ---
  const [admins, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        name: true,
        createdAt: true,
        lastLogin: true,
        status: true,
      },
    }),
    this.prisma.user.count({ where }),
  ]);

  return {
    data: admins,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


async updateStatus(userId: string, status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED') {
  const user = await this.prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  await this.prisma.activityLog.create({
    data: {
      userId: user.id,
      action: `STATUS_UPDATE`,
      metadata: `User status changed to ${status}`,
    },
  });

  return { message: `User status updated to ${status}`, user };
}


async getUserById(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      isAdmin: true,
      profilePicture: true,
      phone: true,
      Address: true,
      city: true,
      country: true, 
      postalcode: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}


  async createUser(dto: CreateUserByAdminDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('User already exists');

    const tempPassword = this.generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: `${dto.firstName} ${dto.lastName}`,
      },
    });

    await this.mailService.sendWelcomeEmailWithPassword(dto.email, tempPassword);
    return user;
  }

 async editUser(userId: string, dto: EditUserDto) {
  const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new NotFoundException('User not found');
  }

  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: dto,
  });

  return {
    message: 'User updated successfully',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      fullname: updatedUser.name ?? `${updatedUser.firstname ?? ''} ${updatedUser.lastname ?? ''}`.trim(),
      status: updatedUser.status,
    },
  };
}


async editAdmin(id: string, dto: EditAdminDto) {
  const existingAdmin = await this.prisma.user.findUnique({ where: { id } });
  if (!existingAdmin) {
    throw new NotFoundException('Admin not found');
  }

  const updatedAdmin = await this.prisma.user.update({
    where: { id },
    data: dto,
  });

  return {
    message: 'Admin updated successfully',
    admin: {
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      fullname: updatedAdmin.name ?? `${updatedAdmin.firstname ?? ''} ${updatedAdmin.lastname ?? ''}`.trim(),
      status: updatedAdmin.status,
      isAdmin: updatedAdmin.isAdmin,
    },
  };
}


 async updateProfilePicture(id: string, profilePicture: string) {
    const existingAdmin = await this.prisma.user.findUnique({ where: { id } });
    if (!existingAdmin) {
      throw new NotFoundException('Admin not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { profilePicture },
    });

    return {
      message: 'Profile picture updated successfully',
      admin: {
        id: updated.id,
        email: updated.email,
        profilePicture: updated.profilePicture,
      },
    };
  }

  // Optional: prevent editing super admin
  // if (existingAdmin.role === 'SUPER_ADMIN') {
  //   throw new ForbiddenException('You cannot edit a super admin.');
  // }




async deleteUser(userId: string) {
  try {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: 'User deleted successfully.',
    };
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma error: record not found
      return {
        success: false,
        message: 'User not found.',
      };
    }
    throw error; // Let NestJS handle unexpected errors
  }
}


 async activateAdmin(userId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      isAdmin: true,
      status: UserStatus.ACTIVE, 
    },
  });
}

async deactivateAdmin(userId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      isAdmin: true,
      status: UserStatus.DEACTIVATED, 
    },
  });
}
  async inviteUserToBeAdmin(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const token = this.generateInviteToken();
    await this.mailService.sendAdminInvite(email, token);
    return { message: 'Admin invitation sent' };
  }

  async resendAdminInvite(email: string) {
    return this.inviteUserToBeAdmin(email); // Reuse logic
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-8); // 8-char random string
  }

  private generateInviteToken(): string {
    return Math.random().toString(36).substring(2, 12);
  }

async getAssessmentSummary(
  title?: string,
  startYear?: number,
  endYear?: number,
  page = 1,
  limit = 10,
) {
  // ✅ Count all non-admin users
  const totalUsers = await this.prisma.user.count({
    where: { isAdmin: false, isSuperAdmin: false },
  });

  // ✅ Build dynamic filters
  const where: any = {};

  if (title) {
    where.title = { contains: title, mode: 'insensitive' };
  }

  if (startYear && endYear) {
    where.scheduledYear = { gte: Number(startYear), lte: Number(endYear) };
  } else if (startYear) {
    where.scheduledYear = { gte: Number(startYear) };
  } else if (endYear) {
    where.scheduledYear = { lte: Number(endYear) };
  }

  // ✅ Pagination setup
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // ✅ Get total matching records (for pagination metadata)
  const totalRecords = await this.prisma.assessment.count({ where });

  // ✅ Fetch paginated data
  const assessments = await this.prisma.assessment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      userResponses: {
        include: {
          user: {
            select: { id: true, firstname: true, lastname: true, profilePicture: true },
          },
        },
      },
    },
    skip,
    take,
  });

  // ✅ Construct summaries
  const data = assessments.map((assessment) => {
    const filledUsers = assessment.userResponses.length;
    const notFilledUsers = totalUsers - filledUsers;

    return {
      id: assessment.id,
      title: assessment.title,
      scheduledMonth: assessment.scheduledMonth,
      scheduledYear: assessment.scheduledYear,
      totalUsers,
      filledUsers,
      notFilledUsers,
      completionRate:
        totalUsers > 0 ? ((filledUsers / totalUsers) * 100).toFixed(1) + '%' : '0%',
      createdAt: assessment.createdAt,
    };
  });

  // ✅ Return paginated response
  return {
    meta: {
      currentPage: Number(page),
      limit: Number(limit),
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    },
    data,
  };
}


  // ✅ Optionally: View details of who filled / not filled
async getAssessmentDetails(
  title?: string,
  startYear?: string,
  endYear?: string,
  page = 1,
  limit = 10,
) {
  // ✅ Build dynamic filter
  const where: any = {};

  if (title) {
    where.title = { contains: title, mode: 'insensitive' };
  }

  if (startYear && endYear) {
    where.scheduledYear = { gte: Number(startYear), lte: Number(endYear) };
  } else if (startYear) {
    where.scheduledYear = { gte: Number(startYear) };
  } else if (endYear) {
    where.scheduledYear = { lte: Number(endYear) };
  }

  // ✅ Pagination setup
  const skip = (page - 1) * limit;
  const take = limit;

  // ✅ Get total matching records for pagination metadata
  const totalRecords = await this.prisma.assessment.count({ where });

  // ✅ Fetch assessments
  const assessments = await this.prisma.assessment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      userResponses: {
        include: {
          user: {
            select: { id: true, firstname: true, lastname: true, profilePicture: true },
          },
        },
      },
    },
    skip,
    take,
  });

  if (!assessments.length) {
    return {
      meta: { currentPage: page, limit, totalRecords, totalPages: 0 },
      data: [],
      message: 'No assessments found for the given filters.',
    };
  }

  // ✅ Get all non-admin users
  const allUsers = await this.prisma.user.findMany({
    where: { isAdmin: false, isSuperAdmin: false },
    select: { id: true, firstname: true, lastname: true, profilePicture: true },
  });

  // ✅ Build results per assessment
  const data = assessments.map((assessment) => {
    const filledUserIds = new Set(assessment.userResponses.map((r) => r.user?.id));
    const notFilledUsers = allUsers.filter((u) => !filledUserIds.has(u.id));

    return {
      id: assessment.id,
      title: assessment.title,
      scheduledMonth: assessment.scheduledMonth,
      scheduledYear: assessment.scheduledYear,
      filledUsers: assessment.userResponses.map((r) => r.user),
      notFilledUsers,
      totalFilled: assessment.userResponses.length,
      totalNotFilled: notFilledUsers.length,
      createdAt: assessment.createdAt,
    };
  });

  // ✅ Return paginated response
  return {
    meta: {
      currentPage: page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    },
    data,
  };
}



async getSingleAssessmentDetails(assessmentId: string) {
  const assessment = await this.prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      userResponses: {
        include: { user: true },
      },
    },
  });

  if (!assessment) throw new NotFoundException('Assessment not found');

  const allUsers = await this.prisma.user.findMany({
    where: { isAdmin: false, isSuperAdmin: false },
    select: { id: true, firstname: true, lastname: true, profilePicture: true },
  });

  const filledUserIds = new Set(assessment.userResponses.map((r) => r.user?.id));
  const notFilledUsers = allUsers.filter((u) => !filledUserIds.has(u.id));

  return {
    id: assessment.id,
    title: assessment.title,
    scheduledMonth: assessment.scheduledMonth,
    scheduledYear: assessment.scheduledYear,
    filledUsers: assessment.userResponses.map((r) => r.user),
    notFilledUsers,
    totalFilled: assessment.userResponses.length,
    totalNotFilled: notFilledUsers.length,
  };
}



async getUserAssessmentReport(
  year: number = new Date().getFullYear(),
  page = 1,
  limit = 10,
) {
  // 1️⃣ Fetch all non-admin users
  const totalUsers = await this.prisma.user.count({
    where: { isAdmin: false, isSuperAdmin: false },
  });

  // Pagination logic
  const skip = (page - 1) * limit;
  const take = limit;

  const users = await this.prisma.user.findMany({
    where: { isAdmin: false, isSuperAdmin: false },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      profilePicture: true,
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });

  // 2️⃣ Fetch all assessments for the given year
  const assessments = await this.prisma.assessment.findMany({
    where: { scheduledYear: year },
    select: { id: true, scheduledMonth: true, scheduledYear: true },
  });

  // 3️⃣ Fetch all user responses for that year
  const userAssessments = await this.prisma.userAssessment.findMany({
    where: { assessment: { scheduledYear: year } },
    select: {
      userId: true,
      assessment: { select: { scheduledMonth: true } },
    },
  });

  // 4️⃣ Define all 12 months
  const months = eachMonthOfInterval({
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 11, 31)),
  }).map((m) => format(m, 'MMMM'));

  // 5️⃣ Build report
  const data = users.map((user) => {
    const monthStatus: Record<string, string> = {};

    for (const month of months) {
      const monthAssessment = assessments.find(
        (a) => a.scheduledMonth === month && a.scheduledYear === year,
      );

      if (!monthAssessment) {
        monthStatus[month] = 'NULL'; // no assessment that month
      } else {
        const hasSubmitted = userAssessments.some(
          (ua) => ua.userId === user.id && ua.assessment.scheduledMonth === month,
        );
        monthStatus[month] = hasSubmitted ? 'DONE' : 'NOT DONE';
      }
    }

    return {
      userId: user.id,
      fullname: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
      profilePicture: user.profilePicture,
      ...monthStatus,
    };
  });

  // 6️⃣ Return with pagination metadata
  return {
    meta: {
      year,
      totalUsers,
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
    },
    data,
  };
}

async getAssessmentsSummary(
  title?: string,
  startYear?: string,
  endYear?: string,
  page = 1,
  limit = 10,
) {
  // 🧩 Dynamic filter
  const where: any = {};

  if (title) {
    where.title = { contains: title, mode: 'insensitive' };
  }

  if (startYear && endYear) {
    where.scheduledYear = { gte: Number(startYear), lte: Number(endYear) };
  } else if (startYear) {
    where.scheduledYear = { gte: Number(startYear) };
  } else if (endYear) {
    where.scheduledYear = { lte: Number(endYear) };
  }

  // 🔢 Pagination setup
  const skip = (page - 1) * limit;
  const take = limit;

  // 📊 Total count (for metadata)
  const total = await this.prisma.assessment.count({ where });

  // 📄 Fetch paginated results
  const assessments = await this.prisma.assessment.findMany({
    where,
    include: {
      questions: true,
      userResponses: true,
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

  // 🧮 Empty result handling
  if (!assessments.length) {
    return { message: 'No assessments found for the provided filters.' };
  }

  // 🧾 Summarize
  const data = assessments.map((a) => ({
    id: a.id,
    title: a.title,
    date: a.scheduledFor,
    scheduledYear: a.scheduledYear,
    totalQuestions: a.questions.length,
    totalReplies: a.userResponses.length,
    status: a.status,
  }));

  // 📦 Return paginated structure
  return {
    meta: {
      total,
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: { title, startYear, endYear },
    },
    data,
  };
}

  
}

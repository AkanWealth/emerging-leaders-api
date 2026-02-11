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

@Injectable()
export class AdminUserService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

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

    // --- Smart search logic ---
    if (search) {
      const cleanSearch = search.trim();
      const terms = cleanSearch.split(/\s+/); // split by spaces

      if (terms.length === 1) {
        // Single term: search firstname, lastname, or email
        where.OR = [
          { firstname: { contains: cleanSearch, mode: 'insensitive' } },
          { lastname: { contains: cleanSearch, mode: 'insensitive' } },
          { email: { contains: cleanSearch, mode: 'insensitive' } },
        ];
      } else if (terms.length >= 2) {
        // Multiple terms (assume first + last name)
        const [first, last] = terms;
        where.OR = [
          {
            AND: [
              { firstname: { contains: first, mode: 'insensitive' } },
              { lastname: { contains: last, mode: 'insensitive' } },
            ],
          },
          {
            AND: [
              { firstname: { contains: last, mode: 'insensitive' } },
              { lastname: { contains: first, mode: 'insensitive' } },
            ],
          },
          { email: { contains: cleanSearch, mode: 'insensitive' } },
        ];
      }

      // Optional: if the search looks like a valid date
      const maybeDate = new Date(cleanSearch);
      if (!isNaN(maybeDate.getTime())) {
        where.OR = where.OR || [];
        where.OR.push(
          { createdAt: { gte: maybeDate } },
          { lastLogin: { gte: maybeDate } },
        );
      }
    }

    // --- Optional status filter ---
    if (status) {
      where.status = status.toUpperCase(); // match enum case
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
      // Trim extra spaces and normalize search text
      const cleanSearch = search.trim();
      const terms = cleanSearch.split(/\s+/); // split by space

      if (terms.length === 1) {
        // Single term: search by firstname, lastname, or email
        where.OR = [
          { firstname: { contains: cleanSearch, mode: 'insensitive' } },
          { lastname: { contains: cleanSearch, mode: 'insensitive' } },
          { email: { contains: cleanSearch, mode: 'insensitive' } },
        ];
      } else if (terms.length >= 2) {
        // Two or more words (assume first and last name)
        const [first, last] = terms;
        where.OR = [
          {
            AND: [
              { firstname: { contains: first, mode: 'insensitive' } },
              { lastname: { contains: last, mode: 'insensitive' } },
            ],
          },
          {
            AND: [
              { firstname: { contains: last, mode: 'insensitive' } },
              { lastname: { contains: first, mode: 'insensitive' } },
            ],
          },
          // Also include email search just in case
          { email: { contains: cleanSearch, mode: 'insensitive' } },
        ];
      }

      // Optional: if search looks like a date (for createdAt / lastLogin)
      const maybeDate = new Date(cleanSearch);
      if (!isNaN(maybeDate.getTime())) {
        where.OR = where.OR || [];
        where.OR.push(
          { createdAt: { gte: maybeDate } },
          { lastLogin: { gte: maybeDate } },
        );
      }
    }

    // --- Optional status filter ---
    if (status) {
      where.status = status.toUpperCase(); // Prisma enum-safe
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

  async updateStatus(
    userId: string,
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED',
  ) {
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
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('User already exists');

    const tempPassword = this.generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstname: dto.firstName,
        lastname: dto.lastName,
      },
    });

    await this.mailService.sendWelcomeEmailWithPassword(
      dto.email,
      tempPassword,
    );
    return user;
  }

  async editUser(userId: string, dto: EditUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
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
        fullname:
          updatedUser.firstname ??
          `${updatedUser.firstname ?? ''} ${updatedUser.lastname ?? ''}`.trim(),
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
        fullname:
          updatedAdmin.firstname ??
          `${updatedAdmin.firstname ?? ''} ${updatedAdmin.lastname ?? ''}`.trim(),
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

  // async getAssessmentSummary(
  //   search?: string,
  //   year?: number,
  //   page = 1,
  //   limit = 10,
  // ) {
  //   // ✅ Count all non-admin users
  //   const totalUsers = await this.prisma.user.count({
  //     where: { isAdmin: false, isSuperAdmin: false },
  //   });

  //   // ✅ Build dynamic filters
  //   const where: any = {};

  //   // 🔍 Search by multiple fields: title, month, category name (if relational)
  //   if (search) {
  //     where.OR = [
  //       { title: { contains: search, mode: 'insensitive' } },
  //       { scheduledMonth: { contains: search, mode: 'insensitive' } },
  //       {
  //         category: {
  //           name: { contains: search, mode: 'insensitive' },
  //         },
  //       },
  //     ];
  //   }

  //   // 📅 Filter by year only
  //   if (year) {
  //     where.scheduledYear = Number(year);
  //   }

  //   // ✅ Pagination setup
  //   const skip = (Number(page) - 1) * Number(limit);
  //   const take = Number(limit);

  //   // ✅ Get total matching records
  //   const totalRecords = await this.prisma.assessment.count({ where });

  //   // ✅ Fetch paginated data
  //   const assessments = await this.prisma.assessment.findMany({
  //     where,
  //     orderBy: { createdAt: 'desc' },
  //     include: {
  //       category: true,
  //       userResponses: {
  //         include: {
  //           user: {
  //             select: {
  //               id: true,
  //               firstname: true,
  //               lastname: true,
  //               profilePicture: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //     skip,
  //     take,
  //   });

  //   // ✅ Construct summaries
  //   const data = assessments.map((assessment) => {
  //     const filledUsers = assessment.userResponses.length;
  //     const notFilledUsers = totalUsers - filledUsers;

  //     return {
  //       id: assessment.id,
  //       title: assessment.title,
  //       category: assessment.category?.name ?? 'N/A',
  //       scheduledMonth: assessment.scheduledMonth,
  //       scheduledYear: assessment.scheduledYear,
  //       totalUsers,
  //       filledUsers,
  //       notFilledUsers,
  //       completionRate:
  //         totalUsers > 0
  //           ? ((filledUsers / totalUsers) * 100).toFixed(1) + '%'
  //           : '0%',
  //       createdAt: assessment.createdAt,
  //     };
  //   });

  //   // ✅ Return paginated response
  //   return {
  //     meta: {
  //       currentPage: Number(page),
  //       limit: Number(limit),
  //       totalRecords,
  //       totalPages: Math.ceil(totalRecords / limit),
  //     },
  //     data,
  //   };
  // }

  // Optionally: View details of who filled / not filled
 
  async getAssessmentSummary(
  search?: string,
  year?: number,
  page = 1,
  limit = 10,
) {
  // ✅ Count all non-admin users (optional, keep for metadata)
  const totalUsers = await this.prisma.user.count({
    where: { isAdmin: false, isSuperAdmin: false },
  });

  // ✅ Build dynamic filters
  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { scheduledMonth: { contains: search, mode: 'insensitive' } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (year) {
    where.scheduledYear = Number(year);
  }

  // Pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Total matching assessments
  const totalRecords = await this.prisma.assessment.count({ where });

  // Fetch assessments with assigned users/responses
  const assessments = await this.prisma.assessment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      userResponses: true, // we only need userResponses here
    },
    skip,
    take,
  });

  // Construct summaries
  const data = assessments.map((assessment) => {
    const totalAssigned = assessment.userResponses.length;
    const filledUsers = assessment.userResponses.filter(
      (ur) => ur.submittedAt !== null,
    ).length;
    const notFilledUsers = totalAssigned - filledUsers;

    return {
      id: assessment.id,
      title: assessment.title,
      category: assessment.category?.name ?? 'N/A',
      scheduledMonth: assessment.scheduledMonth,
      scheduledYear: assessment.scheduledYear,
      totalAssigned,
      filledUsers,
      notFilledUsers,
      completionRate:
        totalAssigned > 0
          ? ((filledUsers / totalAssigned) * 100).toFixed(1) + '%'
          : '0%',
      createdAt: assessment.createdAt,
    };
  });

  // Return paginated response
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
              select: {
                id: true,
                firstname: true,
                lastname: true,
                profilePicture: true,
              },
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
      select: {
        id: true,
        firstname: true,
        lastname: true,
        profilePicture: true,
      },
    });

    // ✅ Build results per assessment
    const data = assessments.map((assessment) => {
      const filledUserIds = new Set(
        assessment.userResponses.map((r) => r.user?.id),
      );
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
      select: {
        id: true,
        firstname: true,
        lastname: true,
        profilePicture: true,
      },
    });

    const filledUserIds = new Set(
      assessment.userResponses.map((r) => r.user?.id),
    );
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

  // async getUserAssessmentReport(
  //   year: number = new Date().getFullYear(),
  //   search?: string,
  //   page = 1,
  //   limit = 10,
  // ) {
  //   // 1️⃣ Build search filter for users
  //   const userWhere: any = {
  //     isAdmin: false,
  //     isSuperAdmin: false,
  //   };

  //   if (search) {
  //     userWhere.OR = [
  //       { firstname: { contains: search, mode: 'insensitive' } },
  //       { lastname: { contains: search, mode: 'insensitive' } },
  //     ];
  //   }

  //   // 2️⃣ Count and paginate users
  //   const totalUsers = await this.prisma.user.count({ where: userWhere });
  //   const skip = (page - 1) * limit;
  //   const take = limit;

  //   const users = await this.prisma.user.findMany({
  //     where: userWhere,
  //     select: {
  //       id: true,
  //       firstname: true,
  //       lastname: true,
  //       profilePicture: true,
  //     },
  //     skip,
  //     take,
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   // 3️⃣ Fetch all assessments for the given year (optionally filtered by search month)
  //   const assessmentsWhere: any = { scheduledYear: year };
  //   if (search) {
  //     // If the search matches a month (e.g., "March"), include that
  //     assessmentsWhere.OR = [
  //       { scheduledMonth: { contains: search, mode: 'insensitive' } },
  //       { title: { contains: search, mode: 'insensitive' } },
  //     ];
  //   }

  //   const assessments = await this.prisma.assessment.findMany({
  //     where: assessmentsWhere,
  //     select: { id: true, scheduledMonth: true, scheduledYear: true },
  //   });

  //   // 4️⃣ Fetch all user responses for that year
  //   const userAssessments = await this.prisma.userAssessment.findMany({
  //     where: { assessment: { scheduledYear: year } },
  //     select: {
  //       userId: true,
  //       assessment: { select: { scheduledMonth: true } },
  //     },
  //   });

  //   // 5️⃣ Define all 4 quarters
  //   const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  //   // 6️⃣ Build report
  //   const data = users.map((user) => {
  //     const quarterStatus: Record<string, string> = {};

  //     for (const quarter of quarters) {
  //       const quarterAssessment = assessments.find(
  //         (a) => a.scheduledMonth === quarter && a.scheduledYear === year,
  //       );

  //       if (!quarterAssessment) {
  //         quarterStatus[quarter] = 'NULL'; // no assessment that quarter
  //       } else {
  //         const hasSubmitted = userAssessments.some(
  //           (ua) =>
  //             ua.userId === user.id && ua.assessment.scheduledMonth === quarter,
  //         );
  //         quarterStatus[quarter] = hasSubmitted ? 'DONE' : 'NOT DONE';
  //       }
  //     }

  //     return {
  //       userId: user.id,
  //       fullname: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
  //       profilePicture: user.profilePicture,
  //       ...quarterStatus,
  //     };
  //   });

  //   // 7️⃣ Return with pagination metadata
  //   return {
  //     meta: {
  //       year,
  //       totalUsers,
  //       currentPage: page,
  //       limit,
  //       totalPages: Math.ceil(totalUsers / limit),
  //     },
  //     data,
  //   };
  // }

  

 async getUserAssessmentReport(
  year?: number,
  search?: string,
  page: number = 1,
  limit: number = 10,
) {
  const selectedYear = year ?? new Date().getFullYear();

  // 1️⃣ Build user filter
  const userWhere: any = {
    isAdmin: false,
    isSuperAdmin: false,
  };

  if (search) {
    userWhere.OR = [
      { firstname: { contains: search, mode: 'insensitive' } },
      { lastname: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const totalUsers = await this.prisma.user.count({ where: userWhere });

  const users = await this.prisma.user.findMany({
    where: userWhere,
    select: {
      id: true,
      firstname: true,
      lastname: true,
      profilePicture: true,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const userIds = users.map((u) => u.id);

  // 2️⃣ Get all user assessments for the selected year
  const userAssessments = await this.prisma.userAssessment.findMany({
    where: {
      userId: { in: userIds },
      assessment: {
        scheduledYear: selectedYear,
      },
    },
    select: {
      userId: true,
      submittedAt: true,
      intervalIndex: true,
      assessment: {
        select: {
          scheduledYear: true,
        },
      },
    },
  });

  const intervalMap = ['1 Month Interval', '3 Month Interval', '6 Month Interval'];

  // 3️⃣ Build report
  const data = users.map((user) => {
    const assessments = userAssessments.filter((ua) => ua.userId === user.id);

    const totalAssigned = assessments.length;
    const completed = assessments.filter((a) => a.submittedAt !== null).length;
    const pending = totalAssigned - completed;

    // Determine the latest interval (for display purposes)
    const latest = [...assessments].sort((a, b) => {
      const aDate = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bDate = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return bDate - aDate;
    })[0];

    let currentInterval = 'Not Started';
    if (latest && latest.intervalIndex !== null && latest.intervalIndex !== undefined) {
      currentInterval = intervalMap[latest.intervalIndex] ?? 'Not Started';
    }

    // Determine status: DONE / NOT DONE / NULL
    let status: string;
    if (totalAssigned === 0) {
      status = 'NULL'; // no assessment assigned
    } else if (completed === totalAssigned) {
      status = 'DONE'; // all submitted
    } else {
      status = 'NOT DONE'; // some assigned, not all submitted
    }

    const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

    return {
      userId: user.id,
      fullname: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
      profilePicture: user.profilePicture,
      totalAssigned,
      completed,
      pending,
      completionRate: `${completionRate}%`,
      currentInterval, // shows next scheduled period
      status,          // DONE / NOT DONE / NULL
    };
  });

  return {
    meta: {
      year: selectedYear,
      totalUsers,
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
    },
    data,
  };
}


async getUserQuarterlyAssessmentReport(
  year?: number,
  search?: string,
  page: number = 1,
  limit: number = 10,
) {
  const selectedYear = year ?? new Date().getFullYear();

  // 1️⃣ Build user filter
  const userWhere: any = {
    isAdmin: false,
    isSuperAdmin: false,
  };

  if (search) {
    userWhere.OR = [
      { firstname: { contains: search, mode: 'insensitive' } },
      { lastname: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const totalUsers = await this.prisma.user.count({ where: userWhere });

  const users = await this.prisma.user.findMany({
    where: userWhere,
    select: {
      id: true,
      firstname: true,
      lastname: true,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const userIds = users.map((u) => u.id);

  // 2️⃣ Get all user assessments for the year
  const userAssessments = await this.prisma.userAssessment.findMany({
    where: {
      userId: { in: userIds },
      assessment: {
        scheduledYear: selectedYear,
      },
    },
    select: {
      userId: true,
      submittedAt: true,
      intervalIndex: true,
      assessment: {
        select: {
          scheduledMonth: true,
          scheduledYear: true,
        },
      },
    },
  });

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const intervalMap = ['1 Month Interval', '3 Month Interval', '6 Month Interval'];

  // 3️⃣ Build quarterly report
  const data = users.map((user) => {
    const assessments = userAssessments.filter((ua) => ua.userId === user.id);

    // Initialize each quarter as NULL
    const quarterStatus: Record<string, string> = {
      Q1: 'NULL',
      Q2: 'NULL',
      Q3: 'NULL',
      Q4: 'NULL',
    };

    // Map each assessment to the appropriate quarter based on intervalIndex
    assessments.forEach((a) => {
      // intervalIndex: 0 => 1M → Q1, 1 => 3M → Q2, 2 => 6M → Q3 (adjust as needed)
      const interval = a.intervalIndex ?? 0;
      let quarterKey = 'Q4'; // default if out of bounds
      if (interval === 0) quarterKey = 'Q1';
      else if (interval === 1) quarterKey = 'Q2';
      else if (interval === 2) quarterKey = 'Q3';

      quarterStatus[quarterKey] = a.submittedAt ? 'DONE' : 'NOT DONE';
    });

    return {
      userId: user.id,
      fullname: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
      ...quarterStatus,
    };
  });

  return {
    meta: {
      year: selectedYear,
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

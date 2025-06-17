// src/activity-log/activity-log.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(userId: string, action: string) {
    return this.prisma.activityLog.create({
      data: { userId, action },
    });
  }
}

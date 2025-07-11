import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService, ActivityLogService],
})
export class ProjectModule {}

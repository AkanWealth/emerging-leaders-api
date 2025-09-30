import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, ActivityLogService],
})
export class ProjectModule {}

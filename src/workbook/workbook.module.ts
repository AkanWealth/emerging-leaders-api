import { Module } from '@nestjs/common';
import { WorkbookService } from './workbook.service';
import { WorkbookController } from './workbook.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WorkbookController],
  providers: [WorkbookService, PrismaService],
})
export class WorkbookModule {}

import { Module } from '@nestjs/common';
import { NotebookService } from './notebook.service';
import { NotebookController } from './notebook.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NotebookController],
  providers: [NotebookService, PrismaService],
})
export class NotebookModule {}

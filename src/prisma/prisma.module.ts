import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],  // This allows you to use PrismaService in other modules
})
export class PrismaModule {}

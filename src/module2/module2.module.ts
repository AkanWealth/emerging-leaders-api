import { Module } from '@nestjs/common';
import { Module2Service } from './module2.service';
import { Module2Controller } from './module2.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [Module2Controller],
  providers: [Module2Service, PrismaService],
})
export class Module2Module {}

import { Module } from '@nestjs/common';
import { Module3Service } from './module3.service';
import { Module3Controller } from './module3.controller';

@Module({
  controllers: [Module3Controller],
  providers: [Module3Service],
})
export class Module3Module {}

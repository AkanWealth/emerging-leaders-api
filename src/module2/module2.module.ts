import { Module } from '@nestjs/common';
import { Module2Service } from './module2.service';
import { Module2Controller } from './module2.controller';

@Module({
  controllers: [Module2Controller],
  providers: [Module2Service],
})
export class Module2Module {}

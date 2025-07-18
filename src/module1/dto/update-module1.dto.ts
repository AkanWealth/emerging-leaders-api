import { PartialType } from '@nestjs/swagger';
import { CreateModule1Dto } from './create-module1.dto';

export class UpdateModule1Dto extends PartialType(CreateModule1Dto) {}

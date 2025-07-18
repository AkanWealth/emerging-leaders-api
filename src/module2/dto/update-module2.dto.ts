import { PartialType } from '@nestjs/swagger';
import { CreateModule2Dto } from './create-module2.dto';

export class UpdateModule2Dto extends PartialType(CreateModule2Dto) {}

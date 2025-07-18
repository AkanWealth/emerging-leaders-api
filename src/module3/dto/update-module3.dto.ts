import { PartialType } from '@nestjs/swagger';
import { CreateModule3Dto } from './create-module3.dto';

export class UpdateModule3Dto extends PartialType(CreateModule3Dto) {}

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Module1Service } from './module1.service';
import { CreateModule1Dto } from './dto/create-module1.dto';
import { UpdateModule1Dto } from './dto/update-module1.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Module1 - Lead Yourself')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('module1')
export class Module1Controller {
  constructor(private readonly service: Module1Service) {}

  @Post()
  @ApiOperation({ summary: 'Create Module1 for user' })
  @ApiBody({ type: CreateModule1Dto })
  @ApiResponse({ status: 201, description: 'Module1 created' })
  create(@Body() dto: CreateModule1Dto, @Req() req: any) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Module1 for user' })
  @ApiResponse({ status: 200, description: 'Module1 fetched successfully' })
  findOne(@Req() req: any) {
    return this.service.findOne(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update Module1 for user' })
  @ApiBody({ type: UpdateModule1Dto })
  @ApiResponse({ status: 200, description: 'Module1 updated' })
  update(@Body() dto: UpdateModule1Dto, @Req() req: any) {
    return this.service.update(req.user.id, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Module1 for user' })
  @ApiResponse({ status: 200, description: 'Module1 deleted' })
  remove(@Req() req: any) {
    return this.service.remove(req.user.id);
  }
}

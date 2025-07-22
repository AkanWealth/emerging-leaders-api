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
import { Module2Service } from './module2.service';
import { CreateModule2Dto } from './dto/create-module2.dto';
import { UpdateModule2Dto } from './dto/update-module2.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Module2 - Lead Your Finances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('module2')
export class Module2Controller {
  constructor(private readonly service: Module2Service) {}

  @Post()
  @ApiOperation({ summary: 'Create or update Module2 for the current user' })
  @ApiBody({ type: CreateModule2Dto })
  @ApiResponse({ status: 201, description: 'Module2 created/updated successfully' })
  create(@Body() dto: CreateModule2Dto, @Req() req: any) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Module2 data for the current user' })
  @ApiResponse({ status: 200, description: 'Module2 data retrieved successfully' })
  findOne(@Req() req: any) {
    return this.service.findOne(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update Module2 data for the current user' })
  @ApiBody({ type: UpdateModule2Dto })
  @ApiResponse({ status: 200, description: 'Module2 updated successfully' })
  update(@Body() dto: UpdateModule2Dto, @Req() req: any) {
    return this.service.update(req.user.id, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Module2 for the current user' })
  @ApiResponse({ status: 200, description: 'Module2 deleted successfully' })
  remove(@Req() req: any) {
    return this.service.remove(req.user.id);
  }
}

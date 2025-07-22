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
import { Module3Service } from './module3.service';
import { CreateModule3Dto } from './dto/create-module3.dto';
import { UpdateModule3Dto } from './dto/update-module3.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Module3 - Lead Your Project')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('module3')
export class Module3Controller {
  constructor(private readonly service: Module3Service) {}

  @Post()
  @ApiOperation({ summary: 'Create Module3 for current user' })
  @ApiBody({ type: CreateModule3Dto })
  @ApiResponse({ status: 201, description: 'Module3 created successfully' })
  @ApiResponse({ status: 409, description: 'Module3 already exists' })
  create(@Body() dto: CreateModule3Dto, @Req() req: any) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Module3 for current user' })
  @ApiResponse({ status: 200, description: 'Module3 retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Module3 not found' })
  findOne(@Req() req: any) {
    return this.service.findOne(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update Module3 for current user' })
  @ApiBody({ type: UpdateModule3Dto })
  @ApiResponse({ status: 200, description: 'Module3 updated successfully' })
  @ApiResponse({ status: 404, description: 'Module3 not found' })
  update(@Body() dto: UpdateModule3Dto, @Req() req: any) {
    return this.service.update(req.user.id, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Module3 for current user' })
  @ApiResponse({ status: 200, description: 'Module3 deleted successfully' })
  @ApiResponse({ status: 404, description: 'Module3 not found' })
  remove(@Req() req: any) {
    return this.service.remove(req.user.id);
  }
}

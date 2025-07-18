import {
  Controller,
  Post,
  Get,
  Param,
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
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Module1 - Lead Yourself')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workbooks/:workbookId/module1')
export class Module1Controller {
  constructor(private readonly service: Module1Service) {}

  @Post()
  @ApiOperation({ summary: 'Create Module1 for a workbook' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiBody({ type: CreateModule1Dto })
  @ApiResponse({ status: 201, description: 'Module1 created' })
  create(
    @Param('workbookId') workbookId: string,
    @Body() dto: CreateModule1Dto,
    @Req() req: any,
  ) {
    return this.service.create(workbookId, req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Module1 of a workbook for current user' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiResponse({ status: 200, description: 'Module1 fetched successfully' })
  findOne(@Param('workbookId') workbookId: string, @Req() req: any) {
    return this.service.findOne(workbookId, req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update Module1 of a workbook for current user' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiBody({ type: UpdateModule1Dto })
  @ApiResponse({ status: 200, description: 'Module1 updated' })
  update(
    @Param('workbookId') workbookId: string,
    @Body() dto: UpdateModule1Dto,
    @Req() req: any,
  ) {
    return this.service.update(workbookId, req.user.id, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Module1 of a workbook for current user' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiResponse({ status: 200, description: 'Module1 deleted' })
  remove(@Param('workbookId') workbookId: string, @Req() req: any) {
    return this.service.remove(workbookId, req.user.id);
  }
}

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
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
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Module2 - Lead Your Finances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workbooks/:workbookId/module2')
export class Module2Controller {
  constructor(private readonly service: Module2Service) {}

  @Post()
  @ApiOperation({ summary: 'Create Module2 responses for a workbook and user' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiBody({ type: CreateModule2Dto })
  @ApiResponse({ status: 201, description: 'Module2 entry created successfully' })
  @ApiResponse({ status: 404, description: 'Workbook not found' })
  create(
    @Param('workbookId') workbookId: string,
    @Body() dto: CreateModule2Dto,
    @Req() req: any,
  ) {
    return this.service.create(workbookId, req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Module2 responses for a specific user and workbook' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiResponse({ status: 200, description: 'Module2 data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Module2 not found' })
  findOne(@Param('workbookId') workbookId: string, @Req() req: any) {
    return this.service.findOne(workbookId, req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update Module2 responses for a workbook and user' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiBody({ type: UpdateModule2Dto })
  @ApiResponse({ status: 200, description: 'Module2 updated successfully' })
  @ApiResponse({ status: 404, description: 'Module2 not found' })
  update(
    @Param('workbookId') workbookId: string,
    @Body() dto: UpdateModule2Dto,
    @Req() req: any,
  ) {
    return this.service.update(workbookId, req.user.id, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Module2 responses for a workbook and user' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiResponse({ status: 200, description: 'Module2 deleted successfully' })
  @ApiResponse({ status: 404, description: 'Module2 not found' })
  remove(@Param('workbookId') workbookId: string, @Req() req: any) {
    return this.service.remove(workbookId, req.user.id);
  }
}

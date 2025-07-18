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
import { Module3Service } from './module3.service';
import { CreateModule3Dto } from './dto/create-module3.dto';
import { UpdateModule3Dto } from './dto/update-module3.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Module3 - Lead Your Project')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workbooks/:workbookId/module3')
export class Module3Controller {
  constructor(private readonly service: Module3Service) {}

  @Post()
  @ApiOperation({ summary: 'Create Module3 for a workbook' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiBody({ type: CreateModule3Dto })
  @ApiResponse({ status: 201, description: 'Module3 created successfully' })
  @ApiResponse({ status: 404, description: 'Workbook not found' })
  create(
    @Param('workbookId') workbookId: string,
    @Body() dto: CreateModule3Dto,
    @Req() req: any,
  ) {
    return this.service.create(workbookId, req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Module3 of a workbook for the current user' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiResponse({ status: 200, description: 'Module3 retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Module3 not found' })
  findOne(@Param('workbookId') workbookId: string, @Req() req: any) {
    return this.service.findOne(workbookId, req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update Module3 of a workbook for the current user' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiBody({ type: UpdateModule3Dto })
  @ApiResponse({ status: 200, description: 'Module3 updated successfully' })
  @ApiResponse({ status: 404, description: 'Module3 not found' })
  update(
    @Param('workbookId') workbookId: string,
    @Body() dto: UpdateModule3Dto,
    @Req() req: any,
  ) {
    return this.service.update(workbookId, req.user.id, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Module3 of a workbook for the current user' })
  @ApiParam({ name: 'workbookId', type: String })
  @ApiResponse({ status: 200, description: 'Module3 deleted successfully' })
  @ApiResponse({ status: 404, description: 'Module3 not found' })
  remove(@Param('workbookId') workbookId: string, @Req() req: any) {
    return this.service.remove(workbookId, req.user.id);
  }
}

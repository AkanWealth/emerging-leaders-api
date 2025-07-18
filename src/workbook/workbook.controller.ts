import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { WorkbookService } from './workbook.service';
import { CreateWorkbookDto } from './dto/create-workbook.dto';
import { UpdateWorkbookDto } from './dto/update-workbook.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Workbook')
@Controller('workbooks')
export class WorkbookController {
  constructor(private readonly workbookService: WorkbookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workbook' })
  @ApiResponse({ status: 201, description: 'Workbook created successfully' })
  create(@Body() dto: CreateWorkbookDto) {
    return this.workbookService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workbooks' })
  findAll() {
    return this.workbookService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workbook by ID' })
  findOne(@Param('id') id: string) {
    return this.workbookService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workbook by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkbookDto) {
    return this.workbookService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workbook by ID' })
  remove(@Param('id') id: string) {
    return this.workbookService.remove(id);
  }
}

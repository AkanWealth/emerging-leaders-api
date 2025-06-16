// content.controller.ts
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
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/decorators/guards/admin.guard';

@ApiTags('Admin Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a content item' })
  create(@Body() dto: CreateContentDto, @Req() req: any) {
    return this.contentService.create(dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a content item' })
  update(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.contentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content' })
  delete(@Param('id') id: string) {
    return this.contentService.delete(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive content' })
  archive(@Param('id') id: string) {
    return this.contentService.archive(id);
  }

  @Patch(':id/recover')
  @ApiOperation({ summary: 'Recover archived content' })
  recover(@Param('id') id: string) {
    return this.contentService.recover(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish draft content' })
  publish(@Param('id') id: string) {
    return this.contentService.publish(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all content items' })
  getAll() {
    return this.contentService.getAll();
  }
}
